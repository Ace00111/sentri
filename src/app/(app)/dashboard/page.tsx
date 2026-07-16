'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState, useCallback } from 'react'
import WalletPill from '@/components/WalletPill'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Activity {
  type: string
  asset: string
  value: string
  from: string
  to: string
  hash: string
  timeAgo: string
  isIncoming: boolean
}

interface Approval {
  address: string
  shortAddress: string
  asset: string
}

interface BalancePoint {
  time: string
  value: number
}

interface DashboardData {
  balanceEth: string
  balanceUsd: string
  balanceHistory: BalancePoint[]
  activity: Activity[]
  tokenCount: number
  approvals: Approval[]
  walletHealth: number
  gasSpentUsd: string
}

const PERIODS = ['1D', '7D', '30D'] as const
type Period = typeof PERIODS[number]

export default function Dashboard() {
  const { address } = useAccount()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<Period>('1D')

  const fetchData = useCallback(async (addr: string, p: Period) => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, period: p })
      })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!address) { setData(null); return }
    fetchData(address, period)
  }, [address, period, fetchData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cardBg border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-mutedText mb-1">{label}</p>
          <p className="font-bold text-sentriGreen">${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {/* BEGIN: TopBar */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <WalletPill />
      </div>
      {/* END: TopBar */}

      {/* BEGIN: DashboardGrid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Total Balance & Activity */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* BEGIN: BalanceCard */}
          <section className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="total-balance-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-mutedText text-sm mb-1 font-medium">Total Balance</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl font-bold">
                    {loading ? '...' : data ? `$${Number(data.balanceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                  </h2>
                  {data && <span className="text-sentriGreen text-lg font-medium">{data.balanceEth} ETH</span>}
                </div>
              </div>
              {/* Time Tabs */}
              <div className="bg-black/50 p-1 rounded-lg flex gap-1">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${period === p ? 'bg-sentriGreen text-black' : 'text-mutedText hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* Area Chart */}
            <div className="w-full h-44 mt-2">
              {loading ? (
                <div className="flex items-center justify-center h-full text-mutedText text-sm animate-pulse">Loading chart...</div>
              ) : data && data.balanceHistory && data.balanceHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.balanceHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B7FF00" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#B7FF00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#B7FF00"
                      strokeWidth={2}
                      fill="url(#balGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#B7FF00', stroke: '#111', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="chart-placeholder w-full h-full rounded-xl" />
                </div>
              )}
            </div>
          </section>
          {/* END: BalanceCard */}

          {/* BEGIN: RecentActivityCard */}
          <section className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="recent-activity">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <a className="text-mutedText text-sm hover:text-sentriGreen transition-colors" href="#">View all</a>
            </div>
            {loading ? (
              <div className="text-center py-8 text-mutedText animate-pulse">Loading transactions...</div>
            ) : data && data.activity.length > 0 ? (
              <div className="space-y-6">
                {data.activity.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.isIncoming ? 'bg-sentriGreen/10 text-sentriGreen' : 'bg-gray-500/10 text-mutedText'}`}>
                        {tx.isIncoming ? (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                        ) : (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{tx.type}</p>
                        <p className="text-mutedText text-xs">{tx.isIncoming ? tx.from : tx.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.isIncoming ? 'text-sentriGreen' : ''}`}>{tx.value}</p>
                      <p className="text-mutedText text-xs">{tx.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : address ? (
              <div className="text-center py-8 text-mutedText">No recent activity found</div>
            ) : (
              <div className="text-center py-8 text-mutedText">Connect your wallet to view activity</div>
            )}
          </section>
          {/* END: RecentActivityCard */}
        </div>

        {/* Right Column: Wallet Health & Risky Contracts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* BEGIN: WalletHealthCard */}
          <section className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="wallet-health">
            <h3 className="text-lg font-bold mb-6">Wallet Health</h3>
            {address && data ? (
              <>
                <div className="flex justify-center mb-8">
                  <div className="circular-progress" style={{ background: `conic-gradient(#B7FF00 ${data.walletHealth * 3.6}deg, #222 0deg)` }}>
                    <div className="relative z-10 text-center">
                      <span className="text-3xl font-bold">{data.walletHealth}</span>
                      <span className="text-mutedText text-xs">/100</span>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${data.walletHealth >= 80 ? 'text-sentriGreen' : data.walletHealth >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {data.walletHealth >= 80 ? 'Good' : data.walletHealth >= 60 ? 'Fair' : 'At Risk'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.approvals.length === 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sentriGreen">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
                        </svg>
                      </span>
                      <span className="text-sm">No token approvals found</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
                        </svg>
                      </span>
                      <span className="text-sm">{data.approvals.length} contract(s) with token interactions</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-sentriGreen">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
                      </svg>
                    </span>
                    <span className="text-sm">All systems secure</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-mutedText">
                {loading ? 'Loading...' : 'Connect your wallet to see health'}
              </div>
            )}
          </section>
          {/* END: WalletHealthCard */}

          {/* BEGIN: RiskyContractsCard */}
          <section className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="risky-contracts">
            <h3 className="text-lg font-bold mb-6">Top Risky Contracts</h3>
            {address && data ? (
              <>
                <div className="space-y-4 mb-6">
                  {data.approvals.length > 0 ? data.approvals.map((a, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <span className="font-mono text-sm">{a.shortAddress}</span>
                        <span className="text-mutedText text-xs ml-2">{a.asset}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${i === 0 ? 'text-red-500 bg-red-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                        {i === 0 ? 'Review' : 'Monitor'}
                      </span>
                    </div>
                  )) : (
                    <div className="text-sm text-mutedText text-center">No risky contracts found</div>
                  )}
                </div>
                <a className="text-mutedText text-sm hover:text-sentriGreen transition-colors" href="#">View all</a>
              </>
            ) : (
              <div className="text-sm text-mutedText text-center">{loading ? 'Loading...' : 'N/A'}</div>
            )}
          </section>
          {/* END: RiskyContractsCard */}
        </div>
      </div>
      {/* END: DashboardGrid */}

      {/* BEGIN: BottomStats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Gas Spent */}
        <div className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="stat-gas">
          <p className="text-mutedText text-sm mb-1">Gas Spent (recent txs)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{loading ? '...' : data ? data.gasSpentUsd : '$0.00'}</span>
          </div>
        </div>
        {/* Transactions */}
        <div className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="stat-transactions">
          <p className="text-mutedText text-sm mb-1">Transactions (recent)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{loading ? '...' : data ? data.activity.length : '0'}</span>
          </div>
        </div>
        {/* Assets */}
        <div className="bg-cardBg border border-borderGray rounded-2xl p-6" data-purpose="stat-assets">
          <p className="text-mutedText text-sm mb-1">Assets</p>
          <span className="text-2xl font-bold">{loading ? '...' : data ? data.tokenCount : '0'}</span>
        </div>
      </div>
      {/* END: BottomStats */}
    </>
  )
}
