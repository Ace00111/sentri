'use client'

import { useState } from 'react'
import { sendLocalNotification } from '@/utils/notifications'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useLanguage } from '@/contexts/LanguageContext'

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
  network: string
  contractAddress: string
  price: string
  change: string
  isPositive: boolean
  marketCap: string
  volume24h: string
  circulatingSupply: string
  holders: string
  aiSummary: string
  strengths: string[]
  risks: string[]
  riskScore: number
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk'
  riskReason: string
  securityChecks: {
    smartContract: 'Verified' | 'Unverified'
    ownership: 'Renounced' | 'Owner privileges active'
    mintFunction: 'Not detected' | 'Detected'
    blacklistFunction: 'Not detected' | 'Detected'
    honeypotCheck: 'Passed' | 'Failed'
    proxyContract: 'Not detected' | 'Detected'
  }
  holderAnalysis: {
    top10Percentage: number
    lpPercentage: number
    othersPercentage: number
    warning: string
  }
  liquidityHealth: {
    dex: string
    liquidityAmount: string
    lpStatus: 'Locked' | 'Unlocked'
    trading: 'Healthy' | 'Volatile' | 'Suspicious'
  }
  verdict: {
    status: 'SAFE TO EXPLORE' | 'PROCEED WITH CAUTION' | 'DO NOT INTERACT'
    message: string
  }
  ohlcData: { time: string; open: number; high: number; low: number; close: number }[]
}

export default function Research() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState('')
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1D')
  const [copied, setCopied] = useState(false)

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
      if (data) {
        setResult(data)
        sendLocalNotification(`Research Completed: ${data.name}`, `Current Price: ${data.price}. 24h Change: ${data.change}`)
      }
      setLoading(false)
    }
  }

  const handleQuickSearch = async (query: string) => {
    setSearchQuery(query)
    setLoading(true)
    setResult(null)
    const data = await fetchResult(query, PERIOD_DAYS[chartPeriod])
    if (data) {
      setResult(data)
      sendLocalNotification(`Research Completed: ${data.name}`, `Current Price: ${data.price}. 24h Change: ${data.change}`)
    }
    setLoading(false)
  }

  const handlePeriodChange = async (p: ChartPeriod) => {
    if (!result) return
    setChartPeriod(p)
    setChartLoading(true)
    const data = await fetchResult(result.name, PERIOD_DAYS[p])
    if (data) setResult(data)
    setChartLoading(false)
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string | number }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
          <p className="text-zinc-500 mb-1">{label}</p>
          <p className="font-bold text-brand">${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
        </div>
      )
    }
    return null
  }

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Low Risk': return 'text-brand'
      case 'Medium Risk': return 'text-orange-400'
      case 'High Risk': return 'text-red-500'
      default: return 'text-zinc-400'
    }
  }

  const getRiskBg = (level: string) => {
    switch(level) {
      case 'Low Risk': return 'bg-brand/10'
      case 'Medium Risk': return 'bg-orange-400/10'
      case 'High Risk': return 'bg-red-500/10'
      default: return 'bg-zinc-800'
    }
  }

  const getVerdictColor = (status: string) => {
    switch(status) {
      case 'SAFE TO EXPLORE': return 'text-brand'
      case 'PROCEED WITH CAUTION': return 'text-orange-400'
      case 'DO NOT INTERACT': return 'text-red-500'
      default: return 'text-zinc-400'
    }
  }

  const getVerdictBg = (status: string) => {
    switch(status) {
      case 'SAFE TO EXPLORE': return 'bg-brand/10 border-brand/20'
      case 'PROCEED WITH CAUTION': return 'bg-orange-400/10 border-orange-400/20'
      case 'DO NOT INTERACT': return 'bg-red-500/10 border-red-500/20'
      default: return 'bg-surface border-white/5'
    }
  }

  const getCheckIcon = (value: string, expected: string) => {
    if (value === expected) {
      return (
        <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-12" data-purpose="main-layout">
      {/* Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('research')}</h1>
      </header>

      {/* BEGIN: SearchBar */}
      <div className="mb-8 max-w-3xl" data-purpose="search-container">
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
            className="block w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all font-mono"
            placeholder="Search token ticker or contract address..."
            type="text"
          />
        </div>
        {error && (
          <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>
        )}
        
        {!result && !loading && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-zinc-500 text-sm">Quick examples:</span>
            {['$PEPE', '$ETH', '0x83a...92bd'].map(ex => (
              <button 
                key={ex} 
                onClick={() => handleQuickSearch(ex === '0x83a...92bd' ? 'PEPE' : ex.replace('$', ''))}
                className="px-3 py-1 bg-surface border border-white/5 hover:border-brand/30 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* END: SearchBar */}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <p className="text-brand animate-pulse font-bold">Initializing Token Workspace...</p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* TOP TOKEN HEADER CARD */}
          <div className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6" data-purpose="token-hero-card">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-black font-bold text-xl shadow-[0_0_20px_rgba(183,255,0,0.2)]">
                {result.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">${result.symbol}</h2>
                  <span className="text-zinc-400 text-lg">{result.name}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-300 font-mono">{result.network}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono">{result.price}</span>
                    <span className={`text-sm font-bold ${result.isPositive ? 'text-brand' : 'text-red-400'}`}>{result.change}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10"></div>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-brand transition-colors group"
                  >
                    <span className="font-mono text-sm">{result.contractAddress.substring(0, 6)}...{result.contractAddress.substring(result.contractAddress.length - 4)}</span>
                    {copied ? (
                      <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/5 ${getRiskBg(result.riskLevel)}`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>{result.riskScore}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <p className={`font-bold ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}</p>
                <p className="text-xs text-zinc-400 max-w-[150px] leading-tight mt-0.5">{result.riskReason}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* SECTION 1: AI Research Summary */}
            <div className="lg:col-span-2 bg-surface border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Analysis</h3>
              </div>
              
              <p className="text-zinc-300 leading-relaxed mb-6">
                Sentri analyzed this token across contract behavior, liquidity, holder distribution and market activity. {result.aiSummary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5">
                  <h4 className="text-brand font-bold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((str, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                        <span className="text-brand mt-0.5">•</span> {str}
                      </li>
                    ))}
                    {result.strengths.length === 0 && <li className="text-zinc-500 text-sm">None detected</li>}
                  </ul>
                </div>
                
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5">
                  <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Risks
                  </h4>
                  <ul className="space-y-2">
                    {result.risks.map((risk, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span> {risk}
                      </li>
                    ))}
                    {result.risks.length === 0 && <li className="text-zinc-500 text-sm">None detected</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 2: Security Checks */}
            <div className="lg:col-span-1 bg-surface border border-white/5 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Security Checks
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Smart Contract</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.smartContract, 'Verified')}
                    <span className={result.securityChecks.smartContract === 'Verified' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.smartContract}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Ownership</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.ownership, 'Renounced')}
                    <span className={result.securityChecks.ownership === 'Renounced' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.ownership}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Mint Function</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.mintFunction, 'Not detected')}
                    <span className={result.securityChecks.mintFunction === 'Not detected' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.mintFunction}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Blacklist</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.blacklistFunction, 'Not detected')}
                    <span className={result.securityChecks.blacklistFunction === 'Not detected' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.blacklistFunction}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Honeypot Check</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.honeypotCheck, 'Passed')}
                    <span className={result.securityChecks.honeypotCheck === 'Passed' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.honeypotCheck}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                  <span className="text-sm text-zinc-400">Proxy Contract</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getCheckIcon(result.securityChecks.proxyContract, 'Not detected')}
                    <span className={result.securityChecks.proxyContract === 'Not detected' ? 'text-zinc-200' : 'text-orange-400'}>{result.securityChecks.proxyContract}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Market Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm font-medium mb-1">Market Cap</p>
              <p className="text-xl font-bold font-mono">{result.marketCap}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm font-medium mb-1">Liquidity</p>
              <p className="text-xl font-bold font-mono">{result.liquidityHealth.liquidityAmount}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm font-medium mb-1">24h Volume</p>
              <p className="text-xl font-bold font-mono">{result.volume24h}</p>
            </div>
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm font-medium mb-1">Holders</p>
              <p className="text-xl font-bold font-mono">{result.holders}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* SECTION 4: Holder Analysis */}
            <div className="bg-surface border border-white/5 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Top Holder Distribution
              </h3>
              
              <div className="flex h-6 rounded-full overflow-hidden mb-6">
                <div style={{ width: `${result.holderAnalysis.top10Percentage}%` }} className="bg-orange-500 hover:opacity-90 transition-opacity" title={`Top 10: ${result.holderAnalysis.top10Percentage}%`}></div>
                <div style={{ width: `${result.holderAnalysis.lpPercentage}%` }} className="bg-brand hover:opacity-90 transition-opacity" title={`LP: ${result.holderAnalysis.lpPercentage}%`}></div>
                <div style={{ width: `${result.holderAnalysis.othersPercentage}%` }} className="bg-zinc-700 hover:opacity-90 transition-opacity" title={`Others: ${result.holderAnalysis.othersPercentage}%`}></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-zinc-400">Top 10 Wallets</span>
                  </div>
                  <p className="font-bold font-mono pl-5">{result.holderAnalysis.top10Percentage}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-brand"></div>
                    <span className="text-xs text-zinc-400">Liquidity Pool</span>
                  </div>
                  <p className="font-bold font-mono pl-5">{result.holderAnalysis.lpPercentage}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <span className="text-xs text-zinc-400">Others</span>
                  </div>
                  <p className="font-bold font-mono pl-5">{result.holderAnalysis.othersPercentage}%</p>
                </div>
              </div>
              
              {result.holderAnalysis.warning && (
                <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>{result.holderAnalysis.warning}</span>
                </div>
              )}
            </div>

            {/* SECTION 5: Liquidity Health */}
            <div className="bg-surface border border-white/5 rounded-3xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Liquidity Health
                </h3>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${result.liquidityHealth.lpStatus === 'Locked' && result.liquidityHealth.trading === 'Healthy' ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-orange-400/10 border-orange-400/20 text-orange-400'}`}>
                  {result.liquidityHealth.lpStatus === 'Locked' && result.liquidityHealth.trading === 'Healthy' ? 'Low Risk' : 'Medium Risk'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                  <span className="text-xs text-zinc-500 mb-1">DEX</span>
                  <span className="font-bold">{result.liquidityHealth.dex}</span>
                </div>
                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                  <span className="text-xs text-zinc-500 mb-1">Liquidity Amount</span>
                  <span className="font-bold font-mono">{result.liquidityHealth.liquidityAmount}</span>
                </div>
                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                  <span className="text-xs text-zinc-500 mb-1">LP Status</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {result.liquidityHealth.lpStatus === 'Locked' ? (
                      <><svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg><span className="text-brand">Locked</span></>
                    ) : (
                      <><svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg><span className="text-orange-400">Unlocked</span></>
                    )}
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                  <span className="text-xs text-zinc-500 mb-1">Trading Status</span>
                  <span className={`font-bold ${result.liquidityHealth.trading === 'Healthy' ? 'text-zinc-200' : 'text-orange-400'}`}>
                    {result.liquidityHealth.trading}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM AI VERDICT */}
          <div className={`p-8 rounded-3xl border flex flex-col items-center text-center ${getVerdictBg(result.verdict.status)}`}>
            <p className="text-sm font-bold text-zinc-400 tracking-widest uppercase mb-2">Sentri Verdict</p>
            <h2 className={`text-3xl font-bold mb-4 ${getVerdictColor(result.verdict.status)} flex items-center gap-3`}>
              {result.verdict.status === 'SAFE TO EXPLORE' && <span className="w-3 h-3 rounded-full bg-brand animate-pulse"></span>}
              {result.verdict.status === 'PROCEED WITH CAUTION' && <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse"></span>}
              {result.verdict.status === 'DO NOT INTERACT' && <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>}
              {result.verdict.status}
            </h2>
            <p className="text-zinc-300 max-w-2xl text-lg mb-8">{result.verdict.message}</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                Analyze Transaction
              </button>
              <button className="px-6 py-3 bg-surface border border-white/10 hover:border-brand/50 text-white font-bold rounded-xl transition-colors">
                Track Token
              </button>
              <button className="px-6 py-3 bg-surface border border-white/10 hover:border-white/30 text-white font-bold rounded-xl transition-colors">
                Share Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
