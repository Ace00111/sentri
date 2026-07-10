import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { hash } = await req.json()

    if (!hash) {
      return new Response(JSON.stringify({ error: 'Missing transaction hash' }), { status: 400 })
    }

    const apiKey = process.env.ALCHEMY_API_KEY
    if (!apiKey) {
      console.warn("No ALCHEMY_API_KEY found, using a fallback public node (rate limited)")
    }

    const rpcUrl = apiKey 
      ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
      : 'https://eth.llamarpc.com' // public fallback

    // 1. Fetch transaction details from the blockchain via RPC
    const txRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [hash],
        id: 1,
      })
    })

    const txData = await txRes.json()
    const tx = txData.result

    if (!tx) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 })
    }

    // 2. Fetch receipt for gas used and status
    const receiptRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [hash],
        id: 1,
      })
    })

    const receiptData = await receiptRes.json()
    const receipt = receiptData.result

    // 3. Send raw transaction data to OpenAI to parse and generate structured risk analysis
    const { object } = await generateObject({
      model: groq('llama-3.1-8b-instant'),
      schema: z.object({
        riskScore: z.enum(['Low', 'Medium', 'High']),
        status: z.string(),
        summary: z.string(),
        gasFee: z.string(),
        recommendation: z.string(),
        contract: z.string(),
        type: z.string(),
        amount: z.string(),
      }),
      system: 'You are an elite smart contract auditor and crypto security AI. Analyze the raw transaction data and transaction receipt provided by the user. Classify the transaction type (e.g., Token Swap, ERC20 Approve, NFT Mint, Transfer), determine what assets are being moved, and assess the security risk. Output the data in the exact JSON schema requested.',
      prompt: `Analyze this transaction on Ethereum Mainnet:\n\nTransaction: ${JSON.stringify(tx, null, 2)}\n\nReceipt: ${JSON.stringify(receipt, null, 2)}`
    })

    return new Response(JSON.stringify(object), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in analyze API:', error)
    return new Response(JSON.stringify({ error: 'Failed to analyze transaction' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
