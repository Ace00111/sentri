import { NextResponse } from 'next/server'
import { groq } from '@ai-sdk/groq'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

// Define the tools we expose to OKX Onchain OS Agents
const TOOLS = [
  {
    name: 'analyze_transaction',
    description: 'Analyze an Ethereum/EVM transaction hash or smart contract address for security risks (honeypot, rug pull, high risk, malicious allowances).',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'The transaction hash (0x...) or contract address (0x...) to analyze.'
        }
      },
      required: ['target']
    }
  },
  {
    name: 'research_token',
    description: 'Retrieve real-time security metrics, volume, price trend, and security risk summary for any crypto token or contract address.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The token name, symbol, or contract address to research (e.g. "UNI", "ethereum", "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984").'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'scam_check',
    description: 'Check a wallet address, smart contract, or dApp website domain name for known phishing, scams, or security blacklists.',
    inputSchema: {
      type: 'object',
      properties: {
        addressOrDomain: {
          type: 'string',
          description: 'The address or website domain to check (e.g. "0x7f9c...", "uniswap-phishing.com").'
        }
      },
      required: ['addressOrDomain']
    }
  }
]

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { method, params } = body

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: { tools: TOOLS }
      })
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params

      if (name === 'analyze_transaction') {
        const target = args?.target || ''
        if (!target) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Missing target argument' }
          })
        }

        // Call the internal analysis logic
        const systemPrompt = `You are Sentri, a crypto security analyst. Analyze the following target (tx hash or contract address): "${target}". Provide a clear risk rating (Low, Medium, High), security warning summary, and a trade recommendation.`
        const { text } = await generateText({
          model: groq('llama-3.1-8b-instant'),
          prompt: `Analyze the security of target: ${target}`,
          system: systemPrompt
        })

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text
              }
            ]
          }
        })
      }

      if (name === 'research_token') {
        const query = args?.query || ''
        if (!query) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Missing query argument' }
          })
        }

        // Fetch basic info from CoinGecko
        let price = 'N/A'
        let change = 'N/A'
        let nameStr = query
        let symbolStr = query
        let description = 'No on-chain description found.'

        try {
          const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
          if (searchRes.ok) {
            const searchData = await searchRes.json()
            const coin = searchData.coins?.[0]
            if (coin) {
              const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&community_data=false&developer_data=false`)
              if (coinRes.ok) {
                const coinData = await coinRes.json()
                nameStr = coinData.name
                symbolStr = coinData.symbol.toUpperCase()
                price = coinData.market_data?.current_price?.usd ? `$${coinData.market_data.current_price.usd}` : 'N/A'
                change = coinData.market_data?.price_change_percentage_24h ? `${coinData.market_data.price_change_percentage_24h.toFixed(2)}%` : 'N/A'
                description = coinData.description?.en?.substring(0, 300) || description
              }
            }
          }
        } catch (e) {
          console.error('Coingecko fetch error in MCP:', e)
        }

        const { object } = await generateObject({
          model: groq('llama-3.1-8b-instant'),
          schema: z.object({
            aiSummary: z.string(),
            contractAudit: z.string(),
            liquidityLock: z.string(),
            holderConcentration: z.string(),
          }),
          system: 'You are an AI crypto analyst. Provide a brief professional security summary and safety audit assessment.',
          prompt: `Analyze token ${nameStr} (${symbolStr}). Price: ${price}, 24h: ${change}. Description: ${description}`
        })

        const textResult = `Token: ${nameStr} (${symbolStr})\nPrice: ${price} (24h Change: ${change})\n\nAI Summary:\n${object.aiSummary}\n\nSecurity Audit: ${object.contractAudit}\nLiquidity Lock Status: ${object.liquidityLock}\nHolder Concentration: ${object.holderConcentration}`

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: textResult
              }
            ]
          }
        })
      }

      if (name === 'scam_check') {
        const addressOrDomain = args?.addressOrDomain || ''
        if (!addressOrDomain) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Missing addressOrDomain argument' }
          })
        }

        // Call LLM for scam checklist
        const { text } = await generateText({
          model: groq('llama-3.1-8b-instant'),
          prompt: `Determine if the following address or website domain is a known scam or phishing target: ${addressOrDomain}. Cross-reference typical threat databases.`,
          system: 'You are a Web3 security inspector. Scan for known hacks, blacklist indicators, fake domain clones, and contract risk indicators.'
        })

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text
              }
            ]
          }
        })
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Tool ${name} not found` }
      })
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid or unsupported method' }
    })
  } catch (error) {
    console.error('MCP Server Error:', error)
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' }
    }, { status: 500 })
  }
}

// Support GET for testing/discovery
export async function GET() {
  return NextResponse.json({
    status: 'Sentri MCP Server Active',
    tools: TOOLS
  })
}
