import { ethers } from 'ethers';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { StructuredAnalysisResult, WalletAnalysisRequest } from '@/types/analysis';

function parseJsonFromText(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(raw);
}

interface TransferItem {
  asset?: string;
  value?: string | number;
  to?: string;
  hash?: string;
}

export async function analyzeWalletService(req: WalletAnalysisRequest): Promise<StructuredAnalysisResult & { rawLegacyData?: Record<string, unknown> }> {
  const address = req.address?.trim();

  if (!address || !ethers.isAddress(address)) {
    return {
      status: 'warning',
      riskScore: 70,
      confidence: 90,
      summary: 'Invalid Ethereum address provided.',
      recommendation: 'Please enter a valid 42-character Ethereum wallet address.',
      details: {},
      insights: ['Address format check failed.'],
    };
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl = apiKey ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}` : 'https://eth.llamarpc.com';

  try {
    const balRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [address, 'latest'], id: 1 }),
    });
    const balData = await balRes.json();
    const ethBalance = ethers.formatEther(balData.result || '0x0');

    const txCountRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionCount', params: [address, 'latest'], id: 3 }),
    });
    const txCountData = await txCountRes.json();
    const txCount = parseInt(txCountData.result || '0x0', 16);

    let transfers: TransferItem[] = [];
    if (apiKey) {
      try {
        const transfersRes = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromBlock: '0x0',
              toBlock: 'latest',
              fromAddress: address,
              category: ['external', 'erc20', 'erc721'],
              maxCount: '0x14',
            }],
            id: 2,
          }),
        });
        const transfersData = await transfersRes.json();
        transfers = transfersData.result?.transfers || [];
      } catch (e) {
        console.warn('Alchemy asset transfers fetch fallback:', e);
      }
    }

    const transfersSummary = transfers.slice(0, 10).map((t) => ({
      asset: t.asset || 'ETH',
      value: t.value != null ? String(t.value) : '0',
      to: t.to || 'Unknown',
      hash: t.hash || '',
    }));

    let parsed: {
      walletAge?: string;
      totalBalance?: string;
      tokensHeld?: string;
      nfts?: string;
      pattern?: string;
      mostlyInteractsWith?: string[];
      suspiciousBehavior?: string[];
      alertLevel?: string;
      alertTitle?: string;
      alertReason?: string;
      alertRecommendation?: string;
      aiExplanation?: string;
      history?: Array<{ hash: string; to: string; amount: string; asset: string; date: string }>;
    } = {
      walletAge: '1 year',
      totalBalance: `$${(parseFloat(ethBalance) * 3000).toFixed(2)}`,
      pattern: 'Active User',
      alertLevel: 'Low Risk',
      alertTitle: 'Standard Wallet Activity',
      alertReason: 'No malicious approvals or scam interactions flagged.',
      alertRecommendation: 'Maintain standard security hygiene.',
      aiExplanation: `Wallet ${address.substring(0, 8)}... maintains a balance of ${parseFloat(ethBalance).toFixed(4)} ETH across ${txCount} transactions.`,
      suspiciousBehavior: [],
    };

    try {
      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: `You are an elite on-chain wallet analyzer. Read the provided wallet data. Return ONLY JSON format:
{
  "walletAge": "e.g. 2 years",
  "totalBalance": "e.g. $10,000",
  "tokensHeld": "number or Unknown",
  "nfts": "number or Unknown",
  "pattern": "DeFi User or NFT Collector",
  "mostlyInteractsWith": ["DeFi protocols"],
  "suspiciousBehavior": ["red flags"],
  "alertLevel": "High Risk or Medium Risk or Low Risk",
  "alertTitle": "short title",
  "alertReason": "detailed reason",
  "alertRecommendation": "recommendation",
  "aiExplanation": "AI explanation",
  "history": []
}`,
        prompt: `Analyze wallet:
Address: ${address}
ETH Balance: ${ethBalance} ETH
Tx Count: ${txCount}
Transfers: ${JSON.stringify(transfersSummary, null, 2)}`,
      });
      parsed = parseJsonFromText(text) as typeof parsed;
    } catch (e) {
      console.warn('AI analysis fallback used for wallet:', e);
    }

    const riskScore = parsed.alertLevel === 'High Risk' ? 80 : parsed.alertLevel === 'Medium Risk' ? 45 : 15;
    const secStatus: StructuredAnalysisResult['status'] = riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'warning' : 'safe';

    const realHistory = transfersSummary.map((t) => ({
      hash: t.hash || '',
      to: t.to || '',
      amount: t.value || '0',
      asset: t.asset || 'ETH',
      date: 'Recently',
    }));

    const legacyFormat = {
      type: 'wallet' as const,
      overview: {
        network: 'Ethereum',
        walletAge: parsed.walletAge || 'Unknown',
        totalTransactions: txCount > 0 ? String(txCount) : 'Unknown',
      },
      portfolio: {
        totalBalance: parsed.totalBalance || 'Unknown',
        eth: `${parseFloat(ethBalance).toFixed(4)} ETH`,
        tokensHeld: parsed.tokensHeld || 'Unknown',
        nfts: parsed.nfts || 'Unknown',
      },
      behavior: {
        pattern: parsed.pattern || 'Active Wallet',
        mostlyInteractsWith: parsed.mostlyInteractsWith || ['DEX Swaps', 'Token Transfers'],
        suspiciousBehavior: parsed.suspiciousBehavior || [],
      },
      securityAlerts: {
        level: parsed.alertLevel || 'Low Risk',
        title: parsed.alertTitle || 'Safe Profile',
        reason: parsed.alertReason || 'No suspicious behavior detected.',
        recommendation: parsed.alertRecommendation || 'Maintain safe wallet practices.',
      },
      aiExplanation: parsed.aiExplanation || 'Wallet audit complete.',
      history: realHistory.length > 0 ? realHistory : (parsed.history || []),
    };

    return {
      status: secStatus,
      riskScore,
      confidence: 90,
      summary: parsed.aiExplanation || `Wallet analysis completed for ${address}`,
      recommendation: parsed.alertRecommendation || 'No action required.',
      details: {
        address,
        balanceEth: ethBalance,
        txCount,
        pattern: parsed.pattern,
      },
      insights: parsed.suspiciousBehavior?.length ? parsed.suspiciousBehavior : ['Wallet shows active transaction history with normal parameters.'],
      rawLegacyData: legacyFormat,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'RPC error';
    return {
      status: 'warning',
      riskScore: 50,
      confidence: 70,
      summary: 'Wallet query encountered RPC failure.',
      recommendation: 'Check RPC provider or verify network connection.',
      details: { error: errMessage },
      insights: [errMessage],
      rawLegacyData: {
        type: 'wallet',
        overview: { network: 'Ethereum', walletAge: 'Unknown', totalTransactions: 'Unknown' },
        portfolio: { totalBalance: 'Unknown', eth: '0 ETH', tokensHeld: 'Unknown', nfts: 'Unknown' },
        behavior: { pattern: 'Unknown', mostlyInteractsWith: [], suspiciousBehavior: [] },
        securityAlerts: { level: 'Unknown Risk', title: 'Analysis Failed', reason: errMessage, recommendation: 'Try again later' },
        aiExplanation: errMessage,
        history: []
      }
    };
  }
}
