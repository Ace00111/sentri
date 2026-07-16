import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { query, chartDays = 1 } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing search query' }), { status: 400 })
    }

    // 1. Search CoinGecko for the token
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!searchRes.ok) {
      if (searchRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please wait a moment and try again.' }), { status: 429 })
      }
      throw new Error(`CoinGecko search failed: ${searchRes.status}`)
    }

    const searchData = await searchRes.json()
    const coin = searchData.coins?.[0]
    if (!coin) {
      return new Response(JSON.stringify({ error: 'Token not found. Try a full name like "ethereum" or "bitcoin".' }), { status: 404 })
    }

    // 2. Get detailed coin data + OHLC chart data in parallel
    const [coinRes, ohlcRes] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { headers: { 'Accept': 'application/json' } }
      ),
      fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/ohlc?vs_currency=usd&days=${chartDays}`,
        { headers: { 'Accept': 'application/json' } }
      )
    ])

    if (!coinRes.ok) throw new Error(`CoinGecko coin data failed: ${coinRes.status}`)

    const coinData = await coinRes.json()

    // 3. Parse OHLC data [timestamp, open, high, low, close]
    let ohlcData: { time: string; open: number; high: number; low: number; close: number }[] = []
    if (ohlcRes.ok) {
      const raw: number[][] = await ohlcRes.json()
      ohlcData = raw.map(([ts, open, high, low, close]) => ({
        time: chartDays <= 1
          ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        open, high, low, close
      }))
    }

    // 4. Format market data
    const price = coinData.market_data?.current_price?.usd
      ? `$${coinData.market_data.current_price.usd.toLocaleString()}`
      : 'N/A'
    const change24h = coinData.market_data?.price_change_percentage_24h ?? 0
    const change = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
    const marketCap = coinData.market_data?.market_cap?.usd
      ? `$${(coinData.market_data.market_cap.usd / 1e9).toFixed(2)}B`
      : 'N/A'
    const volume24h = coinData.market_data?.total_volume?.usd
      ? `$${(coinData.market_data.total_volume.usd / 1e9).toFixed(2)}B`
      : 'N/A'
    const circulatingSupply = coinData.market_data?.circulating_supply
      ? `${(coinData.market_data.circulating_supply / 1e6).toFixed(1)}M ${coin.symbol.toUpperCase()}`
      : 'N/A'

    // 5. AI summary + risk analysis via Groq
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
      system: 'You are an AI crypto security analyst. Given a token name, symbol, current price, 24h change, market cap, and description, provide a concise professional summary and a security risk analysis. Be accurate and use short punchy sentences.',
      prompt: `Token: ${coin.name} (${coin.symbol.toUpperCase()})
Price: ${price} | 24h Change: ${change} | Market Cap: ${marketCap}
Description: ${coinData.description?.en?.substring(0, 600) || 'No description available'}`
    })

    return new Response(JSON.stringify({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price,
      change,
      isPositive: change24h >= 0,
      marketCap,
      volume24h,
      circulatingSupply,
      holders: 'N/A (Requires Pro)',
      aiSummary: object.aiSummary,
      riskAnalysis: object.riskAnalysis,
      ohlcData,
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in research API:', error)
    return new Response(JSON.stringify({ error: 'Failed to research token. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
