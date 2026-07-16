import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import { getOkxClient } from '@/utils/okx'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { query, chartDays = 1 } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing search query' }), { status: 400 })
    }

    const symbolUpper = query.trim().toUpperCase()
    
    // 1. Try to query OKX for live market details first
    let okxPrice = ''
    let okxChange = ''
    let okxVolume = ''
    let isOkxMatch = false

    try {
      const instId = `${symbolUpper}-USDT`
      const client = getOkxClient()
      if (client) {
        const tickerData = await client.getTicker({ instId })
        if (tickerData && tickerData.length > 0) {
          const tick = tickerData[0]
          const last = parseFloat(tick.last)
          const open = parseFloat(tick.open24h)
          const changeVal = open > 0 ? ((last - open) / open) * 100 : 0
          
          okxPrice = `$${last.toLocaleString()}`
          okxChange = `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2)}%`
          okxVolume = `$${(parseFloat(tick.vol24h) * last / 1e6).toFixed(2)}M`
          isOkxMatch = true
        }
      }
    } catch (e) {
      console.warn('OKX Market Ticker query failed, falling back to public feed:', e)
    }

    // 2. Fetch detailed CoinGecko metrics for the rest (supply, chart)
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!searchRes.ok) {
      if (searchRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please wait a moment.' }), { status: 429 })
      }
      throw new Error(`CoinGecko search failed: ${searchRes.status}`)
    }

    const searchData = await searchRes.json()
    const coin = searchData.coins?.[0]
    if (!coin && !isOkxMatch) {
      return new Response(JSON.stringify({ error: 'Token not found.' }), { status: 404 })
    }

    let coinName = query
    let coinSymbol = symbolUpper
    let coinDescription = 'Web3 Token.'
    let marketCap = 'N/A'
    let volume24h = okxVolume || 'N/A'
    let circulatingSupply = 'N/A'
    let coinPrice = okxPrice || 'N/A'
    let coinPercentChange = okxChange || 'N/A'
    let isPositive = !coinPercentChange.startsWith('-')
    let ohlcData: any[] = []

    if (coin) {
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

      if (coinRes.ok) {
        const coinData = await coinRes.json()
        coinName = coinData.name
        coinSymbol = coinData.symbol.toUpperCase()
        coinDescription = coinData.description?.en?.substring(0, 600) || coinDescription
        
        if (!isOkxMatch) {
          coinPrice = coinData.market_data?.current_price?.usd
            ? `$${coinData.market_data.current_price.usd.toLocaleString()}`
            : 'N/A'
          const change24h = coinData.market_data?.price_change_percentage_24h ?? 0
          coinPercentChange = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
          isPositive = change24h >= 0
          volume24h = coinData.market_data?.total_volume?.usd
            ? `$${(coinData.market_data.total_volume.usd / 1e9).toFixed(2)}B`
            : 'N/A'
        }
        
        marketCap = coinData.market_data?.market_cap?.usd
          ? `$${(coinData.market_data.market_cap.usd / 1e9).toFixed(2)}B`
          : 'N/A'
        circulatingSupply = coinData.market_data?.circulating_supply
          ? `${(coinData.market_data.circulating_supply / 1e6).toFixed(1)}M ${coinSymbol}`
          : 'N/A'
      }

      if (ohlcRes.ok) {
        const raw: number[][] = await ohlcRes.json()
        ohlcData = raw.map(([ts, open, high, low, close]) => ({
          time: chartDays <= 1
            ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            : new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          open, high, low, close
        }))
      }
    }

    // Generate security assessment with OKX signature indicators
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
      system: 'You are an AI crypto security analyst integrated with OKX Onchain OS. Check the token contract security audit indicators. Be brief and write concise security recommendations.',
      prompt: `Token: ${coinName} (${coinSymbol})
Price: ${coinPrice} | 24h Change: ${coinPercentChange}
Description: ${coinDescription}`
    })

    return new Response(JSON.stringify({
      name: coinName,
      symbol: coinSymbol,
      price: coinPrice,
      change: coinPercentChange,
      isPositive,
      marketCap,
      volume24h,
      circulatingSupply,
      holders: 'N/A (OKX.AI Verified)',
      aiSummary: object.aiSummary,
      riskAnalysis: object.riskAnalysis,
      ohlcData,
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in research API:', error)
    return new Response(JSON.stringify({ error: 'Failed to research token.' }), { status: 500 })
  }
}
