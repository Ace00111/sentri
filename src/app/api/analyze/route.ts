import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import { ethers } from 'ethers'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { hash, input } = await req.json()
    const val = (input || hash || '').trim()

    if (!val || typeof val !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid input' }), { status: 400 })
    }

    const isAddress = ethers.isAddress(val)
    const isTx = val.length === 66 && val.startsWith('0x')

    if (!isAddress && !isTx) {
      return new Response(JSON.stringify({ error: 'Invalid Ethereum address or transaction hash' }), { status: 400 })
    }

    const apiKey = process.env.ALCHEMY_API_KEY
    if (!apiKey) {
      console.warn("No ALCHEMY_API_KEY found, using a fallback public node (rate limited)")
    }
    const rpcUrl = apiKey 
      ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
      : 'https://eth.llamarpc.com'

    // ==========================================
    // BRANCH 1: TRANSACTION HASH
    // ==========================================
    if (isTx) {
      const txRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionByHash', params: [val], id: 1 })
      })
      const txData = await txRes.json()
      const tx = txData.result

      if (!tx) {
        return new Response(JSON.stringify({ error: 'Transaction not found on mainnet' }), { status: 404 })
      }

      const receiptRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [val], id: 2 })
      })
      const receiptData = await receiptRes.json()
      const receipt = receiptData.result || {}

      // Calculate fee
      const gasUsed = BigInt(receipt.gasUsed || '0x0')
      const effectiveGasPrice = BigInt(receipt.effectiveGasPrice || tx.gasPrice || '0x0')
      const feeWei = gasUsed * effectiveGasPrice
      const feeEth = ethers.formatEther(feeWei)
      const valueEth = ethers.formatEther(tx.value || '0x0')
      const blockNumber = parseInt(tx.blockNumber || '0x0', 16)

      const txPromptData = {
        hash: val,
        block: blockNumber,
        from: tx.from,
        to: tx.to,
        valueEth,
        feeEth,
        status: receipt.status === '0x1' ? 'Success' : 'Failed',
        inputData: tx.input,
      }

      const { object } = await generateObject({
        model: groq('llama-3.1-8b-instant'),
        schema: z.object({
          type: z.literal('transaction'),
          txDetails: z.object({
            method: z.string().describe("e.g. 'Transfer', 'Approve', 'Swap'"),
            block: z.number(),
            age: z.string().describe("e.g. 'Recently'"),
            from: z.string(),
            to: z.string(),
            amount: z.string().describe("e.g. '0.05 ETH'"),
            txnFee: z.string().describe("e.g. '0.001 ETH'"),
          }),
          chatAnalysis: z.object({
            riskLevel: z.enum(['Low', 'Medium', 'High']),
            explanation: z.string().describe("Detailed chat-like explanation of what this transaction did and its safety."),
            redFlags: z.array(z.string()).describe("List of any suspicious findings. Empty if none.")
          })
        }),
        system: `You are an elite smart contract auditor AI. Analyze the raw transaction data. 
Ensure your JSON strictly matches the schema. Do not hallucinate values; use the provided context.
Focus on safety, identifying what the transaction actually does (e.g. if input data looks like an ERC20 transfer or approval).`,
        prompt: `Analyze this Ethereum transaction:\n\n${JSON.stringify(txPromptData, null, 2)}`
      })

      return new Response(JSON.stringify(object), { headers: { 'Content-Type': 'application/json' } })
    }

    // ==========================================
    // BRANCH 2: WALLET ADDRESS
    // ==========================================
    if (isAddress) {
      // 1. Get ETH Balance
      const balRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [val, 'latest'], id: 1 })
      })
      const balData = await balRes.json()
      const ethBalance = ethers.formatEther(balData.result || '0x0')

      // 2. Get Recent Outbound Asset Transfers (using Alchemy specific endpoint)
      const transfersRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            fromAddress: val,
            category: ["external", "erc20", "erc721"],
            maxCount: "0x14" // top 20
          }],
          id: 2
        })
      })
      const transfersData = await transfersRes.json()
      const transfers = transfersData.result?.transfers || []
      
      const totalTxsFound = transfers.length

      const walletPromptData = {
        address: val,
        ethBalance,
        recentTransfers: transfers.slice(0, 10).map((t: any) => ({
          asset: t.asset,
          value: t.value,
          to: t.to,
          hash: t.hash
        }))
      }

      const { object } = await generateObject({
        model: groq('llama-3.1-8b-instant'),
        schema: z.object({
          type: z.literal('wallet'),
          overview: z.object({
            network: z.string().default('Ethereum'),
            walletAge: z.string().describe("Estimate based on activity"),
            totalTransactions: z.string(),
          }),
          portfolio: z.object({
            totalBalance: z.string().describe("e.g. '$10,000' (estimate)"),
            eth: z.string().describe("ETH balance exact"),
            tokensHeld: z.string(),
            nfts: z.string(),
          }),
          behavior: z.object({
            pattern: z.string().describe("e.g. 'DeFi Swaps', 'NFT Mints'"),
            mostlyInteractsWith: z.array(z.string()),
            suspiciousBehavior: z.array(z.string()),
          }),
          securityAlerts: z.object({
            level: z.enum(['High Risk', 'Medium Risk', 'Low Risk']),
            title: z.string(),
            reason: z.string(),
            recommendation: z.string(),
          }),
          aiExplanation: z.string().describe("A conversational AI analysis of this wallet's safety profile."),
          history: z.array(z.object({
            hash: z.string(),
            to: z.string(),
            amount: z.string(),
            asset: z.string(),
            date: z.string()
          })).describe("List of recent transactions.")
        }),
        system: `You are an elite on-chain wallet analyzer. Read the provided wallet data and activity history.
Do not hallucinate exact historical dates if not provided, but extrapolate gracefully.
Ensure strict adherence to the output schema.
If there are many varied token transfers, classify as a DeFi user.
If it transfers out huge amounts to unknown wallets, flag as suspicious.`,
        prompt: `Analyze this Ethereum wallet:\n\n${JSON.stringify(walletPromptData, null, 2)}\n\nExtrapolate portfolio $ value reasonably based on ETH balance.`
      })

      // Patch the exact ETH balance directly to avoid LLM hallucinating it
      object.portfolio.eth = `${parseFloat(ethBalance).toFixed(4)} ETH`
      if (object.overview.totalTransactions === "0") {
        object.overview.totalTransactions = totalTxsFound > 0 ? `${totalTxsFound}+` : "Unknown"
      }

      return new Response(JSON.stringify(object), { headers: { 'Content-Type': 'application/json' } })
    }

  } catch (error) {
    console.error('Error in analyze API:', error)
    return new Response(JSON.stringify({ error: 'Failed to analyze input' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
