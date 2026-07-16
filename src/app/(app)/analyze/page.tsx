'use client'

import { useState } from 'react'
import { sendLocalNotification } from '@/utils/notifications'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Analyze() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!input) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() })
      })
      if (!res.ok) {
        throw new Error('Failed to analyze input')
      }
      const data = await res.json()
      setResult(data)
      sendLocalNotification(`Analysis Completed`, `Successfully loaded ${data.type} profile.`)
    } catch (e) {
      console.error(e)
      alert('Failed to analyze. Make sure you entered a valid transaction hash or wallet address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Search */}
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('transactionAnalyzer') || 'On-chain Profiler'}</h1>
        <p className="text-mutedText mt-2">Paste a Wallet Address or Transaction Hash to begin the analysis.</p>
      </header>

      <div className="bg-cardBg rounded-xl p-4 border border-zinc-800/50">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-darkBg border-none rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-sentriGreen/50 text-sm" 
              placeholder="0x..." 
              type="text" 
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-sentriGreen text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {result && result.type === 'transaction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tx Details */}
          <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-8 col-span-1">
            <h2 className="text-lg font-semibold mb-6">Transaction Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">Method</span>
                <span className="text-white text-sm font-bold bg-zinc-900 px-2 py-1 rounded">{result.txDetails.method}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">Block</span>
                <span className="text-sentriGreen text-sm font-medium">{result.txDetails.block}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">Age</span>
                <span className="text-white text-sm font-medium">{result.txDetails.age}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">From</span>
                <span className="text-white text-xs font-mono truncate max-w-[120px]">{result.txDetails.from}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">To</span>
                <span className="text-white text-xs font-mono truncate max-w-[120px]">{result.txDetails.to}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50 pb-2">
                <span className="text-mutedText text-sm">Amount</span>
                <span className="text-white text-sm font-bold">{result.txDetails.amount}</span>
              </div>
              <div className="flex justify-between items-center py-1 pb-2">
                <span className="text-mutedText text-sm">Txn Fee</span>
                <span className="text-white text-sm font-medium">{result.txDetails.txnFee}</span>
              </div>
            </div>
          </div>

          {/* Chat Room Analysis */}
          <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-8 col-span-2 flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sentriGreen animate-pulse"></span>
              AI Auditor Chat Room
            </h2>
            
            <div className="flex-1 bg-darkBg rounded-lg p-6 border border-zinc-800/50 flex flex-col gap-4 overflow-y-auto min-h-[300px]">
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">👤</div>
                <div className="bg-zinc-800 text-white p-3 rounded-lg rounded-tl-none text-sm max-w-[80%]">
                  Please analyze this transaction for me. Is it safe?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sentriGreen flex items-center justify-center shrink-0 text-black font-bold">S</div>
                <div className="bg-sentriGreen/10 border border-sentriGreen/30 text-white p-3 rounded-lg rounded-tl-none text-sm max-w-[90%] leading-relaxed">
                  <p className="mb-4">{result.chatAnalysis.explanation}</p>
                  
                  <div className="mt-4 p-3 rounded bg-black/30">
                    <p className="font-bold mb-2">Risk Level: 
                      <span className={result.chatAnalysis.riskLevel === 'High' ? 'text-red-500 ml-2' : result.chatAnalysis.riskLevel === 'Medium' ? 'text-yellow-500 ml-2' : 'text-sentriGreen ml-2'}>
                        {result.chatAnalysis.riskLevel}
                      </span>
                    </p>
                    {result.chatAnalysis.redFlags?.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-red-400">
                        {result.chatAnalysis.redFlags.map((flag: string, i: number) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {result && result.type === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wallet Overview */}
            <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Wallet Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">Network</p>
                  <p className="text-white font-medium">{result.overview.network}</p>
                </div>
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">Wallet Age</p>
                  <p className="text-white font-medium">{result.overview.walletAge}</p>
                </div>
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">Total Txns</p>
                  <p className="text-white font-medium">{result.overview.totalTransactions}</p>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">Est. Balance</p>
                  <p className="text-2xl font-bold text-sentriGreen">{result.portfolio.totalBalance}</p>
                </div>
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">ETH Held</p>
                  <p className="text-white font-medium">{result.portfolio.eth}</p>
                </div>
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">Tokens Held</p>
                  <p className="text-white font-medium">{result.portfolio.tokensHeld}</p>
                </div>
                <div>
                  <p className="text-mutedText text-xs uppercase tracking-wider mb-1">NFTs</p>
                  <p className="text-white font-medium">{result.portfolio.nfts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Behavior & Alerts */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🔎</span> Wallet Behavior
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sentriGreen font-semibold block mb-1">✅ Pattern: {result.behavior.pattern}</span>
                  </div>
                  <div>
                    <span className="text-mutedText text-sm block mb-1">Mostly interacts with:</span>
                    <ul className="text-sm text-white list-disc pl-4 space-y-1">
                      {result.behavior.mostlyInteractsWith?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  {result.behavior.suspiciousBehavior?.length > 0 && (
                    <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg">
                      <span className="text-red-400 font-semibold block mb-1">⚠️ Suspicious behavior:</span>
                      <ul className="text-sm text-red-300 list-disc pl-4 space-y-1">
                        {result.behavior.suspiciousBehavior.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className={`bg-cardBg border ${result.securityAlerts.level === 'High Risk' ? 'border-red-500/50' : 'border-zinc-800/50'} rounded-xl p-6`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🚨</span> Security Alerts
                </h3>
                <h4 className={`text-lg font-bold mb-2 ${result.securityAlerts.level === 'High Risk' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {result.securityAlerts.level}
                </h4>
                <p className="text-white font-semibold mb-2">❌ {result.securityAlerts.title}</p>
                <p className="text-sm text-mutedText mb-4">{result.securityAlerts.reason}</p>
                <div className="bg-zinc-900 rounded p-3 text-sm">
                  <span className="text-mutedText block mb-1">Recommendation:</span>
                  <span className="text-white">{result.securityAlerts.recommendation}</span>
                </div>
              </div>
            </div>

            {/* AI Explanation & History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-sentriGreen/5 border border-sentriGreen/20 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-bold text-sentriGreen flex items-center gap-2">
                  <span>🧠</span> AI Explanation
                </h3>
                <p className="text-white text-sm leading-relaxed italic">
                  "{result.aiExplanation}"
                </p>
              </div>

              <div className="bg-cardBg border border-zinc-800/50 rounded-xl p-6">
                <h3 className="font-bold mb-6">Recent Transactions History</h3>
                <div className="space-y-3">
                  {result.history?.length > 0 ? (
                    result.history.map((tx: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">To: {tx.to ? tx.to.substring(0, 12) + '...' : 'Contract Creation'}</span>
                          <span className="text-mutedText text-xs font-mono">{tx.hash ? tx.hash.substring(0, 16) + '...' : ''}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold text-sm">{tx.amount || '0'} {tx.asset || 'ETH'}</span>
                          <span className="text-mutedText text-xs">{tx.date || 'Recently'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-mutedText text-sm">No recent history found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
