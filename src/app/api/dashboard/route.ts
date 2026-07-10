export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return new Response(JSON.stringify({ error: 'Missing wallet address' }), { status: 400 })
    }

    const apiKey = process.env.ALCHEMY_API_KEY
    const rpcUrl = apiKey
      ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
      : 'https://eth.llamarpc.com'

    // 1. Fetch ETH balance
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

    // 2. Fetch recent transactions via Alchemy's alchemy_getAssetTransfers
    let transfers: any[] = []
    if (apiKey) {
      const transferRes = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromAddress: address,
            category: ['external', 'erc20', 'erc721'],
            maxCount: '0x5',
            order: 'desc',
            withMetadata: true,
          }],
          id: 1,
        })
      })
      const transferData = await transferRes.json()
      const outgoing = (transferData.result?.transfers || []).map((t: any) => ({ ...t, direction: 'out' }))

      const incomingRes = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [{
            toAddress: address,
            category: ['external', 'erc20', 'erc721'],
            maxCount: '0x5',
            order: 'desc',
            withMetadata: true,
          }],
          id: 1,
        })
      })
      const incomingData = await incomingRes.json()
      const incoming = (incomingData.result?.transfers || []).map((t: any) => ({ ...t, direction: 'in' }))

      // Merge and sort by blockNum descending
      transfers = [...outgoing, ...incoming]
        .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
        .slice(0, 5)
    }

    // 3. Fetch token balances via Alchemy
    let tokenCount = 0
    if (apiKey) {
      const tokenRes = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, {
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
        (t: any) => t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ).length
    }

    // 4. Fetch recent ERC20 Approval events (topic0 for Approval)
    let approvals: any[] = []
    if (apiKey) {
      try {
        const approvalRes = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromAddress: address,
              category: ['erc20'],
              maxCount: '0xa',
              order: 'desc',
              withMetadata: true,
            }],
            id: 1,
          })
        })
        const approvalData = await approvalRes.json()
        const uniqueContracts = new Map<string, any>()
        for (const t of (approvalData.result?.transfers || [])) {
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
        console.error('Failed to fetch approvals:', e)
      }
    }

    // Format transfers for frontend
    const activity = transfers.map((t: any) => {
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

    // Compute a simple wallet health score
    const hasApprovals = approvals.length > 0
    const walletHealth = hasApprovals ? Math.max(60, 100 - approvals.length * 10) : 100

    return new Response(JSON.stringify({
      balanceEth: balEth.toFixed(4),
      balanceUsd: (balEth * 3400).toFixed(2),
      activity,
      tokenCount: tokenCount + 1,
      approvals,
      walletHealth,
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in dashboard API:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), { status: 500 })
  }
}
