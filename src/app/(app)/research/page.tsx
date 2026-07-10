'use client'

import { useState } from 'react'

export default function Research() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    name: string;
    symbol: string;
    price: string;
    change: string;
    marketCap: string;
    volume24h: string;
    circulatingSupply: string;
    holders: string;
    aiSummary: string;
    riskAnalysis: {
      contractAudit: string;
      liquidityLock: string;
      holderConcentration: string;
    }
  } | null>(null)

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      setLoading(true)
      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim() })
        })
        if (!res.ok) {
          throw new Error('Failed to research token')
        }
        const data = await res.json()
        setResult(data)
      } catch (e) {
        console.error(e)
        alert('Failed to find token.')
      } finally {
        setLoading(false)
      }
    }
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
              {/* Token Logo */}
              <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-black">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{result.name} • {result.symbol}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{result.price}</span>
                  <span className="text-brand text-sm font-bold">{result.change}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand font-bold text-sm tracking-wide">AI Verified</span>
            </div>
          </div>
          {/* END: HeroCard */}

          {/* BEGIN: StatsGrid */}
          <div className="grid grid-cols-4 gap-6 mb-8" data-purpose="stats-grid">
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

          {/* BEGIN: MainContentContainer */}
          <div className="flex-1 bg-surface border border-white/5 rounded-3xl mb-8 relative overflow-hidden" data-purpose="graph-container" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(204, 255, 0, 0.08) 0%, rgba(17, 17, 17, 1) 70%)', minHeight: '360px' }}>
            <div className="flex flex-col h-full w-full p-6">
              {/* Chart Header: Timeframes */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-brand/10 text-brand text-xs font-bold">1H</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-white/5 text-zinc-500 text-xs font-medium transition-colors">4H</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-white/5 text-zinc-500 text-xs font-medium transition-colors">1D</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-white/5 text-zinc-500 text-xs font-medium transition-colors">1W</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand"></div>
                    <span className="text-xs text-zinc-400">{result.symbol}/USD</span>
                  </div>
                  <span className="text-xs font-bold text-white">{result.price}</span>
                </div>
              </div>
              {/* Main Chart Area */}
              <div className="flex-1 relative flex">
                {/* Price Axis (Right) */}
                <div className="absolute right-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-zinc-600 border-l border-white/5 pl-2">
                  <span className="">3,600</span>
                  <span className="">3,500</span>
                  <span className="text-brand font-bold">3,412</span>
                  <span className="">3,300</span>
                  <span className="">3,200</span>
                </div>
                {/* Chart Canvas (SVG) */}
                <div className="flex-1 mr-12 mb-8 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-white/5 w-full h-0"></div>
                    <div className="border-b border-white/5 w-full h-0"></div>
                    <div className="border-b border-white/5 w-full h-0"></div>
                    <div className="border-b border-white/5 w-full h-0"></div>
                  </div>
                  {/* Candlesticks & Volume */}
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <rect fill="#CCFF00" height="10" opacity="0.3" width="2" x="5" y="85"></rect>
                    <rect fill="#CCFF00" height="15" opacity="0.3" width="2" x="15" y="80"></rect>
                    <rect fill="#CCFF00" height="7" opacity="0.3" width="2" x="25" y="88"></rect>
                    <rect fill="#CCFF00" height="20" opacity="0.3" width="2" x="35" y="75"></rect>
                    <rect fill="#CCFF00" height="13" opacity="0.3" width="2" x="45" y="82"></rect>
                    <rect fill="#CCFF00" height="25" opacity="0.3" width="2" x="55" y="70"></rect>
                    <rect fill="#CCFF00" height="10" opacity="0.3" width="2" x="65" y="85"></rect>
                    <rect fill="#CCFF00" height="17" opacity="0.3" width="2" x="75" y="78"></rect>
                    <rect fill="#CCFF00" height="13" opacity="0.3" width="2" x="85" y="82"></rect>
                    {/* Candlesticks */}
                    <line stroke="#CCFF00" strokeWidth="0.5" x1="16" x2="16" y1="60" y2="80"></line>
                    <rect fill="#CCFF00" height="10" width="3" x="14.5" y="65"></rect>
                    <line stroke="#CCFF00" strokeWidth="0.5" x1="36" x2="36" y1="40" y2="70"></line>
                    <rect fill="#CCFF00" height="20" width="3" x="34.5" y="45"></rect>
                    <line stroke="#52525b" strokeWidth="0.5" x1="56" x2="56" y1="30" y2="50"></line>
                    <rect fill="#52525b" height="10" width="3" x="54.5" y="35"></rect>
                    <line stroke="#CCFF00" strokeWidth="0.5" x1="76" x2="76" y1="20" y2="45"></line>
                    <rect fill="#CCFF00" height="15" width="3" x="74.5" y="25"></rect>
                    {/* Crosshair */}
                    <line stroke="#CCFF00" strokeDasharray="1,1" strokeWidth="0.2" x1="0" x2="100" y1="32" y2="32"></line>
                    <line stroke="#CCFF00" strokeDasharray="1,1" strokeWidth="0.2" x1="76" x2="76" y1="0" y2="100"></line>
                    <circle cx="76" cy="32" fill="#CCFF00" r="1.5"></circle>
                  </svg>
                </div>
                {/* Time Axis (Bottom) */}
                <div className="absolute bottom-0 left-0 right-12 h-8 flex justify-between items-center text-[10px] text-zinc-600 border-t border-white/5 pr-4">
                  <span className="">08:00</span>
                  <span className="">12:00</span>
                  <span className="">16:00</span>
                  <span className="text-zinc-400">20:00</span>
                  <span className="">00:00</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: MainContentContainer */}

          {/* BEGIN: BottomRow */}
          <div className="grid grid-cols-3 gap-8 pb-8">
            {/* AI Summary */}
            <div className="col-span-2 bg-surface border border-white/5 rounded-3xl p-8" data-purpose="ai-summary-card">
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
            <div className="col-span-1 bg-surface border border-white/5 rounded-3xl p-8" data-purpose="risk-analysis-card">
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
