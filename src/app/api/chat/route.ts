import { groq } from '@ai-sdk/groq'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { getOkxClient } from '@/utils/okx'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      messages,
      system: `You are Sentri, a crypto security assistant integrated with OKX Onchain OS. 
Your job is to analyze wallet addresses, transactions, or smart contracts provided by the user. 
You can query live market data for tokens via OKX. 
You help users understand what a transaction is doing and warn them about honeypots, rug pulls, or malicious allowances. 
Be concise, security-focused, and helpful.`,
      tools: {
        getMarketData: tool({
          description: 'Get live market data for a token from OKX. Pass the token symbol (e.g. BTC, ETH).',
          parameters: z.object({
            symbol: z.string().describe('The token symbol, e.g. BTC, ETH'),
          }),
          // @ts-expect-error - Groq types sometimes reject execute but it works at runtime
          execute: async ({ symbol }): Promise<any> => {
            try {
              const instId = `${symbol.toUpperCase()}-USDT`
              const client = getOkxClient()
              if (!client) return { error: 'OKX SDK client not configured.' }
              
              const data = await client.getTicker({ instId })
              if (data && data.length > 0) {
                const tick = data[0]
                return {
                  symbol: symbol.toUpperCase(),
                  price: parseFloat(tick.last),
                  vol24h: parseFloat(tick.vol24h),
                  open24h: parseFloat(tick.open24h),
                }
              }
              return { error: 'Token market data not found on OKX.' }
            } catch (e) {
              return { error: 'Failed to fetch market data from OKX SDK.' }
            }
          }
        })
      }
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
