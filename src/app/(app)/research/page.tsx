'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

type ChartPeriod = '1H' | '4H' | '1D' | '1W'

const PERIOD_DAYS: Record<ChartPeriod, number> = {
  '1H': 1,
  '4H': 1,
  '1D': 1,
  '1W': 7,
}

interface ResearchResult {
  name: string
  symbol: string
  price: string
  change: string
  isPositive: boolean
  marketCap: string
  volume24h: string
  circulatingSupply: string
  holders: string
  aiSummary: string
  riskAnalysis: {
    contractAudit: string
    liquidityLock: string
    holderConcentration: string
  }
  ohlcData: { time: string; open: number; high: number; low: number; close: number }[]
}

export default function Research() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState('')
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1D')

  const fetchResult = async (query: string, days: number) => {
    setError('')
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), chartDays: days })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to find token.')
        return null
      }
      return data as ResearchResult
    } catch {
      setError('Network error. Please try again.')
      return null
    }
  }

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setLoading(true)
      setResult(null)
      const data = await fetchResult(searchQuery, PERIOD_DAYS[chartPeriod])
      if (data) setResult(data)
      setLoading(false)
    }
  }

  const handlePeriodChange = async (p: ChartPeriod) => {
    if (!result) return
    setChartPeriod(p)
    setChartLoading(true)
    const data = await fetchResult(result.name, PERIOD_DAYS[p])
    if (data) setResult(data)
    setChartLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-zinc-500 mb-1">{label}</p>
          <p className="font-bold text-brand">${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex-1 flex flex-col min-w-0" data-purpose="main-layout">
      {/* Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Token Research</h1>
      </header>

      {/* BEGIN: SearchBar */}
      <div className="mb-8" data-purpose="search-container">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="block w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
            placeholder="Search any token, ticker, or contract address... (Press Enter)"
            type="text"
          />
        </div>
        {error && (
          <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>
        )}
      </div>
      {/* END: SearchBar */}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <p className="text-brand animate-pulse font-bold">Researching {searchQuery}...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* BEGIN: HeroCard */}
          <div className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 flex items-center justify-between" data-purpose="token-hero-card">
            <div className="flex items-center gap-6">
              {/* Token Logo placeholder */}
              <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-black font-bold text-lg">
                {result.symbol.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{result.name} • {result.symbol}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{result.price}</span>
                  <span className={`text-sm font-bold ${result.isPositive ? 'text-brand' : 'text-red-400'}`}>{result.change}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand font-bold text-sm tracking-wide">AI Verified</span>
            </div>
          </div>
          {/* END: HeroCard */}

          {/* BEGIN: StatsGrid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" data-purpose="stats-grid">
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-sm font-medium mb-1">Market Cap</p>
              <p className="text-2xl font-bold">{result.marketCap}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-sm font-medium mb-1">24h Volume</p>
              <p className="text-2xl font-bold">{result.volume24h}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-sm font-medium mb-1">Circulating Supply</p>
              <p className="text-2xl font-bold">{result.circulatingSupply}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-sm font-medium mb-1">Holders</p>
              <p className="text-2xl font-bold">{result.holders}</p>
            </div>
          </div>
          {/* END: StatsGrid */}

          {/* BEGIN: ChartContainer */}
          <div className="bg-surface border border-white/5 rounded-3xl mb-8 p-6 relative overflow-hidden" data-purpose="graph-container" style={{ minHeight: '320px' }}>
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {(['1H', '4H', '1D', '1W'] as ChartPeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${chartPeriod === p ? 'bg-brand/10 text-brand' : 'hover:bg-white/5 text-zinc-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand"></div>
                  <span className="text-xs text-zinc-400">{result.symbol}/USD</span>
                </div>
                <span className="text-xs font-bold text-white">{result.price}</span>
              </div>
            </div>
            {/* Chart */}
            <div className="h-64">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full text-brand animate-pulse text-sm font-bold">Updating chart...</div>
              ) : result.ohlcData && result.ohlcData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.ohlcData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: '#52525b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: '#52525b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={65}
                      tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#CCFF00"
                      strokeWidth={2}
                      fill="url(#tokenGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#CCFF00', stroke: '#111', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">No chart data available</div>
              )}
            </div>
          </div>
          {/* END: ChartContainer */}

          {/* BEGIN: BottomRow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
            {/* AI Summary */}
            <div className="md:col-span-2 bg-surface border border-white/5 rounded-3xl p-8" data-purpose="ai-summary-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-brand">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold">AI Summary</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                {result.aiSummary}
              </p>
            </div>
            {/* Risk Analysis */}
            <div className="md:col-span-1 bg-surface border border-white/5 rounded-3xl p-8" data-purpose="risk-analysis-card">
              <h3 className="text-lg font-bold mb-6">Risk Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Contract Audit</span>
                  <span className="text-brand font-bold">{result.riskAnalysis.contractAudit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Liquidity Lock</span>
                  <span className="text-brand font-bold">{result.riskAnalysis.liquidityLock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Holder Concentration</span>
                  <span className="text-orange-500 font-bold">{result.riskAnalysis.holderConcentration}</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: BottomRow */}
        </>
      )}
    </div>
  )
}
