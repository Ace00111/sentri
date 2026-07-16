import { NextResponse } from 'next/server'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const apiKeyHeader = req.headers.get('x-okx-api-key') || ''
    const secretKeyHeader = req.headers.get('x-okx-secret-key') || ''
    
    // Check if the request requires x402 payment challenge (micropayment payload)
    const simulateX402 = req.headers.get('x-simulate-x402') === 'true'
    if (simulateX402) {
      // Return a base64 encoded PAYMENT-REQUIRED payload to satisfy the x402 challenge protocol
      const challengePayload = {
        x402Version: '1.0.0',
        resource: {
          url: req.url,
          description: 'Sentri AI security audit report for premium contract analysis.',
          mimeType: 'application/json'
        },
        accepts: [
          {
            network: 'eip155:196', // X Layer Mainnet
            asset: '0x1a9b3a3d5af5bf1d1762f925bdaddc4201f984', // USDC on X Layer placeholder
            amount: '100000', // $0.10 USDC (6 decimals)
            address: '0x7f9c...8a9f' // Merchant wallet
          }
        ]
      }
      const base64Challenge = Buffer.from(JSON.stringify(challengePayload)).toString('base64')
      return new Response(JSON.stringify({ error: 'Payment Required to access advanced auditing.' }), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-REQUIRED': base64Challenge
        }
      })
    }

    const body = await req.json()
    const { action, target } = body

    if (!action || !target) {
      return NextResponse.json({ error: 'Missing action or target' }, { status: 400 })
    }

    let promptText = ''
    if (action === 'analyze') {
      promptText = `Analyze transaction/address safety for target: ${target}`
    } else if (action === 'research') {
      promptText = `Provide safety audit metrics and overview for: ${target}`
    } else {
      promptText = `Investigate Web3 scam risk for: ${target}`
    }

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: promptText,
      system: 'You are Sentri, an AI Service Provider integrated with OKX Onchain OS. Deliver professional, precise security checks.'
    })

    return NextResponse.json({
      status: 'success',
      provider: 'Sentri ASP',
      action,
      target,
      report: text
    })
  } catch (error) {
    console.error('OKX Service Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
