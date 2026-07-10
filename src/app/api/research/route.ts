import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing search query' }), { status: 400 })
    }

    // 1. Search CoinGecko for the token
    const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
    const searchData = await searchRes.json()

    const coin = searchData.coins?.[0]
    if (!coin) {
      return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 })
    }

    // 2. Get detailed coin data
    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&community_data=false&developer_data=false`)
    const coinData = await coinRes.json()

    // 3. Format basic market data
    const price = coinData.market_data?.current_price?.usd 
      ? `$${coinData.market_data.current_price.usd.toLocaleString()}` 
      : 'N/A'
    const change = coinData.market_data?.price_change_percentage_24h 
      ? `${coinData.market_data.price_change_percentage_24h.toFixed(2)}%` 
      : 'N/A'
    const marketCap = coinData.market_data?.market_cap?.usd 
      ? `$${(coinData.market_data.market_cap.usd / 1e9).toFixed(2)}B` 
      : 'N/A'
    const volume24h = coinData.market_data?.total_volume?.usd 
      ? `$${(coinData.market_data.total_volume.usd / 1e9).toFixed(2)}B` 
      : 'N/A'
    const circulatingSupply = coinData.market_data?.circulating_supply 
      ? `${(coinData.market_data.circulating_supply / 1e6).toFixed(1)}M ${coin.symbol.toUpperCase()}` 
      : 'N/A'

    // 4. Ask OpenAI to summarize and assess risk based on description
    const { object } = await generateObject({
      model: groq('llama-3.1-8b-instant'),
      schema: z.object({
        aiSummary: z.string(),
        riskAnalysis: z.object({
          contractAudit: z.string(),
          liquidityLock: z.string(),
          holderConcentration: z.string(),
        })
      }),
      system: 'You are an AI crypto analyst. Given a token name, symbol, and its description, provide a brief, professional summary of the token and a security risk analysis.',
      prompt: `Analyze the token ${coin.name} (${coin.symbol.toUpperCase()}). Description: ${coinData.description?.en?.substring(0, 500)}...`
    })

    return new Response(JSON.stringify({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price,
      change,
      marketCap,
      volume24h,
      circulatingSupply,
      holders: 'N/A (Requires Pro)',
      aiSummary: object.aiSummary,
      riskAnalysis: object.riskAnalysis
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in research API:', error)
    return new Response(JSON.stringify({ error: 'Failed to research token' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
