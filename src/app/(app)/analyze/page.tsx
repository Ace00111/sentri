'use client'

import { useState } from 'react'
import { sendLocalNotification } from '@/utils/notifications'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Analyze() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  const [result, setResult] = useState<{
    riskScore: string;
    status: string;
    summary: string;
    gasFee: string;
    recommendation: string;
    contract: string;
    type: string;
    amount: string;
  } | null>(null)

  const handleAnalyze = async () => {
    if (!input) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: input.trim() })
      })
      if (!res.ok) {
        throw new Error('Failed to analyze transaction')
      }
      const data = await res.json()
      setResult(data)
      sendLocalNotification(`Analysis Completed`, `Risk Score: ${data.riskScore}. Recommendation: ${data.recommendation}`)
    } catch (e) {
      console.error(e)
      alert('Failed to analyze. Make sure you entered a valid transaction hash (e.g. 0x...).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* BEGIN: Header */}
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('transactionAnalyzer')}</h1>
      </header>
      {/* END: Header */}

      {/* BEGIN: Search Bar Area */}
      <div className="bg-cardBg rounded-xl p-4 border border-zinc-800/50" data-purpose="search-container">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-darkBg border-none rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-sentriGreen/50 text-sm" 
              placeholder={t('searchPlaceholder')} 
              type="text" 
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-sentriGreen text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {t('analyze')}
              </>
            )}
          </button>
        </div>
      </div>
      {/* END: Search Bar Area */}

      {result && (
        <>
          {/* BEGIN: Analysis Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Score Card */}
            <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-12 flex flex-col items-center justify-center text-center" data-purpose="risk-score-card">
              <span className="text-mutedText text-xs font-semibold uppercase tracking-widest mb-8">{t('riskScore')}</span>
              <div className="flex flex-col items-center gap-8">
                <span className={`text-6xl font-bold tracking-tighter ${result.riskScore === 'Low' ? 'text-sentriGreen' : 'text-red-500'}`}>
                  {result.riskScore}
                </span>
                <div className={`w-12 h-0.5 ${result.riskScore === 'Low' ? 'bg-sentriGreen' : 'bg-red-500'}`}></div>
                <p className="text-mutedText text-sm font-medium tracking-tight">No suspicious signals detected</p>
              </div>
            </div>
            {/* Transaction Details Card */}
            <div className="lg:col-span-2 bg-cardBg border border-zinc-800/50 rounded-xl p-8" data-purpose="transaction-details-card">
              <h2 className="text-lg font-semibold mb-6">Transaction Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-mutedText text-sm">Type</span>
                  <span className="text-white text-sm font-medium">{result.type}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-mutedText text-sm">Amount</span>
                  <span className="text-white text-sm font-medium">{result.amount}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-mutedText text-sm">Contract</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{result.contract}</span>
                    <span className="text-mutedText text-xs bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">(Verified)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-mutedText text-sm">Gas Fee</span>
                  <span className="text-white text-sm font-medium">{result.gasFee}</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Analysis Results Grid */}

          {/* BEGIN: Status Banner */}
          <div className="bg-sentriGreen/5 border border-sentriGreen/20 rounded-xl p-6 flex items-start gap-5" data-purpose="security-status-banner">
            <div className="mt-1">
              <div className="w-8 h-8 rounded-full border border-sentriGreen flex items-center justify-center">
                <svg className="w-5 h-5 text-sentriGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">{result.status}</h3>
              <p className="text-mutedText text-sm leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Analysis History */}
      <section className="bg-cardBg border border-zinc-800/50 rounded-xl p-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Analysis History</h3>
          <a className="text-xs text-mutedText hover:text-sentriGreen transition-colors" href="#">View all</a>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-sentriGreen/10 flex items-center justify-center rounded-lg">
                <svg className="w-5 h-5 text-sentriGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Contract: 0x1f98...4A44</h4>
                <p className="text-xs text-mutedText">Uniswap V3 Router</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold text-sentriGreen px-2 py-0.5 border border-sentriGreen/30 rounded uppercase">Safe to Sign</span>
              <p className="text-xs text-mutedText">15 min ago</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
