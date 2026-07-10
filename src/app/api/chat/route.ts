import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      messages,
      system: `You are Sentri, a crypto security assistant. Your job is to analyze wallet addresses, transactions, or smart contracts provided by the user. You help users understand what a transaction is doing and warn them about honeypots, rug pulls, or malicious allowances. Be concise, security-focused, and helpful.`
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
