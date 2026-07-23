export const maxDuration = 30

interface Transfer {
  hash: string
  from: string
  to: string
  value: number | null
  asset: string | null
  category: string
  blockNum: string
  direction: 'in' | 'out'
  metadata?: {
    blockTimestamp: string
  }
  rawContract?: {
    value?: string
    decimal?: string
    address?: string
  }
}

export async function POST(req: Request) {
  try {
    const { address, period = '1D' } = await req.json()

    if (!address) {
      return new Response(JSON.stringify({ error: 'Missing wallet address' }), { status: 400 })
    }

    const apiKey = process.env.ALCHEMY_API_KEY
    const rpcUrl = apiKey
      ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
      : 'https://eth.llamarpc.com'

    // 1. Fetch live ETH price from CoinGecko
    let ethPrice = 3400
    try {
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceRes.json()
      ethPrice = priceData?.ethereum?.usd || 3400
    } catch { /* fallback to 3400 */ }

    // 2. Fetch current ETH balance
    const balRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      })
    })
    const balData = await balRes.json()
    const balWei = BigInt(balData.result || '0x0')
    const balEth = Number(balWei) / 1e18

    // 3. Fetch all transfers (in + out) for history & activity
    let outgoing: Array<Transfer> = []
    let incoming: Array<Transfer> = []
    let allTransfers: Array<Transfer> = []

    if (apiKey) {
      const [outRes, inRes] = await Promise.all([
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromAddress: address,
              category: ['external', 'erc20', 'erc721'],
              maxCount: '0x14',
              order: 'desc',
              withMetadata: true,
            }],
            id: 1,
          })
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              toAddress: address,
              category: ['external', 'erc20', 'erc721'],
              maxCount: '0x14',
              order: 'desc',
              withMetadata: true,
            }],
            id: 1,
          })
        })
      ])
      const outData = await outRes.json()
      const inData = await inRes.json()
      outgoing = (outData.result?.transfers || []).map((t: any) => ({ ...t, direction: 'out' }))
      incoming = (inData.result?.transfers || []).map((t: any) => ({ ...t, direction: 'in' }))
      allTransfers = [...outgoing, ...incoming]
        .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
    }

    // 4. Build balance history for chart
    const now = Date.now()
    const periodMs = period === '1D' ? 86400000 : period === '7D' ? 7 * 86400000 : 30 * 86400000
    const buckets = period === '1D' ? 24 : period === '7D' ? 7 : 30
    const bucketMs = periodMs / buckets

    // Walk back in time: start from current balance, undo transfers
    let runningBalEth = balEth
    const relevantTransfers = allTransfers
      .filter((t) => {
        const ts = t.metadata?.blockTimestamp ? new Date(t.metadata.blockTimestamp).getTime() : 0
        return ts > now - periodMs
      })
      .sort((a, b) => {
        const ta = a.metadata?.blockTimestamp ? new Date(a.metadata.blockTimestamp).getTime() : 0
        const tb = b.metadata?.blockTimestamp ? new Date(b.metadata.blockTimestamp).getTime() : 0
        return tb - ta // newest first
      })

    // Build time buckets
    const bucketData: { time: string; value: number }[] = []
    for (let i = buckets - 1; i >= 0; i--) {
      const bucketEnd = now - i * bucketMs
      // Undo transfers that happened after this bucket end
      for (const t of relevantTransfers) {
        const ts = t.metadata?.blockTimestamp ? new Date(t.metadata.blockTimestamp).getTime() : 0
        if (ts > bucketEnd) {
          const val = t.asset === 'ETH' ? (t.value || 0) : 0
          if (t.direction === 'in') runningBalEth -= val
          else runningBalEth += val
        }
      }
      const label = period === '1D'
        ? new Date(bucketEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        : new Date(bucketEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      bucketData.push({ time: label, value: Math.max(0, runningBalEth * ethPrice) })
    }
    // Restore running balance and add current
    bucketData[bucketData.length - 1].value = balEth * ethPrice

    // 5. Fetch token balances
    let tokenCount = 0
    if (apiKey) {
      const tokenRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          params: [address],
          id: 1,
        })
      })
      const tokenData = await tokenRes.json()
      tokenCount = (tokenData.result?.tokenBalances || []).filter(
        (t: Record<string, unknown>) => t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ).length
    }

    // 6. ERC20 interactions for risky contracts panel
    let approvals: Array<{ address: string; shortAddress: string; asset: string }> = []
    if (apiKey) {
      try {
        const uniqueContracts = new Map<string, { address: string; shortAddress: string; asset: string }>()
        for (const t of outgoing) {
          if (t.rawContract?.address && !uniqueContracts.has(t.rawContract.address)) {
            uniqueContracts.set(t.rawContract.address, {
              address: t.rawContract.address,
              shortAddress: `${t.rawContract.address.slice(0, 6)}...${t.rawContract.address.slice(-4)}`,
              asset: t.asset || 'Unknown',
            })
          }
        }
        approvals = Array.from(uniqueContracts.values()).slice(0, 3)
      } catch (e) {
        console.error('Failed to compute approvals:', e)
      }
    }

    // 7. Compute Gas Spent (30D) — fetch external outgoing txs and sum gas
    let gasSpentEth = 0
    let gasSpentUsd = '0.00'
    if (apiKey) {
      try {
        const externalOut = outgoing.filter(t => t.category === 'external').slice(0, 15)
        const receiptPromises = externalOut.map(t =>
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [t.hash],
              id: 1,
            })
          }).then(r => r.json()).catch(() => null)
        )
        const receipts = await Promise.all(receiptPromises)
        for (const r of receipts) {
          if (r?.result) {
            const gasUsed = parseInt(r.result.gasUsed || '0x0', 16)
            const gasPrice = parseInt(r.result.effectiveGasPrice || '0x0', 16)
            gasSpentEth += (gasUsed * gasPrice) / 1e18
          }
        }
        gasSpentUsd = (gasSpentEth * ethPrice).toFixed(2)
      } catch (e) {
        console.error('Failed to compute gas spent:', e)
      }
    }

    // 8. Format activity for display
    const activity = allTransfers.slice(0, 5).map((t) => {
      const isIncoming = t.direction === 'in'
      const asset = t.asset || 'ETH'
      const value = t.value != null ? Number(t.value).toFixed(4) : '0'
      const category = t.category === 'erc20' ? 'Token Transfer' : t.category === 'erc721' ? 'NFT Transfer' : 'Transfer'
      const timestamp = t.metadata?.blockTimestamp || ''
      let timeAgo = ''
      if (timestamp) {
        const diff = Date.now() - new Date(timestamp).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) timeAgo = `${mins}m ago`
        else if (mins < 1440) timeAgo = `${Math.floor(mins / 60)}h ago`
        else timeAgo = `${Math.floor(mins / 1440)}d ago`
      }
      return {
        type: category,
        asset,
        value: isIncoming ? `+${value} ${asset}` : `-${value} ${asset}`,
        from: t.from ? `${t.from.slice(0, 6)}...${t.from.slice(-4)}` : '',
        to: t.to ? `${t.to.slice(0, 6)}...${t.to.slice(-4)}` : '',
        hash: t.hash,
        timeAgo,
        isIncoming,
      }
    })

    const hasApprovals = approvals.length > 0
    const walletHealth = hasApprovals ? Math.max(60, 100 - approvals.length * 10) : 100

    return new Response(JSON.stringify({
      balanceEth: balEth.toFixed(4),
      balanceUsd: (balEth * ethPrice).toFixed(2),
      balanceHistory: bucketData,
      activity,
      tokenCount: tokenCount + 1,
      approvals,
      walletHealth,
      gasSpentUsd: `$${gasSpentUsd}`,
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in dashboard API:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), { status: 500 })
  }
}
