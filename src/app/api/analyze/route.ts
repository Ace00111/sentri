import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { ethers } from 'ethers'

export const maxDuration = 60

function parseJsonFromText(text: string): any {
  // Try to extract JSON from the response, handling markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim()
  return JSON.parse(raw)
}

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
      const status = receipt.status === '0x1' ? 'Success' : 'Failed'

      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: `You are an elite smart contract auditor AI. Analyze the raw transaction data. 
Return ONLY a JSON object (no markdown, no explanation outside the JSON). The JSON must have this exact structure:
{
  "method": "Transfer or Approve or Swap etc",
  "riskLevel": "Low or Medium or High",
  "explanation": "detailed chat-like explanation of what this transaction did and its safety",
  "redFlags": ["list of suspicious findings, empty array if none"]
}`,
        prompt: `Analyze this Ethereum transaction:
Hash: ${val}
Block: ${blockNumber}
From: ${tx.from}
To: ${tx.to}
Value: ${valueEth} ETH
Fee: ${feeEth} ETH
Status: ${status}
Input Data (first 100 chars): ${(tx.input || '0x').substring(0, 100)}`
      })

      let parsed
      try {
        parsed = parseJsonFromText(text)
      } catch {
        parsed = { method: 'Unknown', riskLevel: 'Medium', explanation: text, redFlags: [] }
      }

      const result = {
        type: 'transaction' as const,
        txDetails: {
          method: parsed.method || 'Unknown',
          block: blockNumber,
          age: 'Recently',
          from: tx.from,
          to: tx.to || 'Contract Creation',
          amount: `${parseFloat(valueEth).toFixed(6)} ETH`,
          txnFee: `${parseFloat(feeEth).toFixed(6)} ETH`,
        },
        chatAnalysis: {
          riskLevel: parsed.riskLevel || 'Medium',
          explanation: parsed.explanation || 'Analysis could not be completed.',
          redFlags: parsed.redFlags || [],
        }
      }

      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
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

      // 2. Get transaction count
      const txCountRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionCount', params: [val, 'latest'], id: 3 })
      })
      const txCountData = await txCountRes.json()
      const txCount = parseInt(txCountData.result || '0x0', 16)

      // 3. Get Recent Outbound Asset Transfers (Alchemy)
      let transfers: any[] = []
      if (apiKey) {
        try {
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
                maxCount: "0x14"
              }],
              id: 2
            })
          })
          const transfersData = await transfersRes.json()
          transfers = transfersData.result?.transfers || []
        } catch (e) {
          console.warn('Alchemy transfers failed, continuing without history:', e)
        }
      }

      const transfersSummary = transfers.slice(0, 10).map((t: any) => ({
        asset: t.asset || 'ETH',
        value: t.value != null ? String(t.value) : '0',
        to: t.to || 'Unknown',
        hash: t.hash || '',
        blockNum: t.blockNum || ''
      }))

      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: `You are an elite on-chain wallet analyzer. Read the provided wallet data.
Return ONLY a JSON object (no markdown, no explanation outside the JSON). The JSON must have this exact structure:
{
  "walletAge": "estimated age like '2 years' or 'Unknown'",
  "totalBalance": "estimated USD value like '$10,000'",
  "tokensHeld": "number or 'Unknown'",
  "nfts": "number or 'Unknown'",
  "pattern": "e.g. 'DeFi User' or 'NFT Collector' or 'Inactive'",
  "mostlyInteractsWith": ["DeFi protocols", "DEX swaps"],
  "suspiciousBehavior": ["any red flags found, or empty array"],
  "alertLevel": "High Risk or Medium Risk or Low Risk",
  "alertTitle": "short title of the main security concern",
  "alertReason": "detailed reason",
  "alertRecommendation": "what user should do",
  "aiExplanation": "conversational AI analysis of this wallet's safety profile",
  "history": [{"hash": "0x...", "to": "0x...", "amount": "0.5", "asset": "ETH", "date": "Recently"}]
}
Base the history on the real transfers provided. Do not invent transaction hashes.`,
        prompt: `Analyze this Ethereum wallet:
Address: ${val}
ETH Balance: ${ethBalance} ETH
Transaction Count (nonce): ${txCount}
Recent Transfers: ${JSON.stringify(transfersSummary, null, 2)}`
      })

      let parsed
      try {
        parsed = parseJsonFromText(text)
      } catch {
        parsed = {
          walletAge: 'Unknown',
          totalBalance: 'Unknown',
          tokensHeld: 'Unknown',
          nfts: 'Unknown',
          pattern: 'Unknown',
          mostlyInteractsWith: [],
          suspiciousBehavior: [],
          alertLevel: 'Medium Risk',
          alertTitle: 'Analysis Incomplete',
          alertReason: 'Could not fully parse AI response.',
          alertRecommendation: 'Exercise caution.',
          aiExplanation: text,
          history: []
        }
      }

      // Build real history from Alchemy transfers if AI didn't include them
      const realHistory = transfersSummary.map((t) => ({
        hash: t.hash,
        to: t.to,
        amount: t.value,
        asset: t.asset,
        date: 'Recently'
      }))

      const result = {
        type: 'wallet' as const,
        overview: {
          network: 'Ethereum',
          walletAge: parsed.walletAge || 'Unknown',
          totalTransactions: txCount > 0 ? String(txCount) : 'Unknown',
        },
        portfolio: {
          totalBalance: parsed.totalBalance || 'Unknown',
          eth: `${parseFloat(ethBalance).toFixed(4)} ETH`,
          tokensHeld: parsed.tokensHeld || 'Unknown',
          nfts: parsed.nfts || 'Unknown',
        },
        behavior: {
          pattern: parsed.pattern || 'Unknown',
          mostlyInteractsWith: parsed.mostlyInteractsWith || [],
          suspiciousBehavior: parsed.suspiciousBehavior || [],
        },
        securityAlerts: {
          level: parsed.alertLevel || 'Medium Risk',
          title: parsed.alertTitle || 'Review Required',
          reason: parsed.alertReason || 'No detailed analysis available.',
          recommendation: parsed.alertRecommendation || 'Exercise caution when interacting.',
        },
        aiExplanation: parsed.aiExplanation || 'Analysis could not be completed.',
        // Prefer real blockchain history over AI-generated
        history: realHistory.length > 0 ? realHistory : (parsed.history || []),
      }

      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    }

  } catch (error) {
    console.error('Error in analyze API:', error)
    return new Response(JSON.stringify({ error: 'Failed to analyze input' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
