import { ethers } from 'ethers';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { StructuredAnalysisResult, TransactionAnalysisRequest } from '@/types/analysis';

function parseJsonFromText(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(raw);
}

export async function analyzeTransactionService(req: TransactionAnalysisRequest): Promise<StructuredAnalysisResult & { rawLegacyData?: Record<string, unknown> }> {
  const txHash = req.txHash || req.from;
  const val = (txHash || '').trim();

  if (!val || !val.startsWith('0x') || val.length !== 66) {
    return {
      status: 'warning',
      riskScore: 60,
      confidence: 90,
      summary: 'Invalid or missing 66-character transaction hash.',
      recommendation: 'Provide a valid 0x transaction hash.',
      details: {},
      insights: ['Transaction hash must begin with 0x and be 66 characters in length.'],
    };
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl = apiKey ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}` : 'https://eth.llamarpc.com';

  try {
    const txRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionByHash', params: [val], id: 1 }),
    });
    const txData = await txRes.json();
    const tx = txData.result;

    if (!tx) {
      return {
        status: 'critical',
        riskScore: 90,
        confidence: 95,
        summary: 'Transaction not found on mainnet RPC node.',
        recommendation: 'Ensure transaction hash has been broadcast and confirmed on-chain.',
        details: { txHash: val },
        insights: ['Transaction hash was not found in the transaction pool or mined blocks.'],
      };
    }

    const receiptRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [val], id: 2 }),
    });
    const receiptData = await receiptRes.json();
    const receipt = receiptData.result || {};

    const gasUsed = BigInt(receipt.gasUsed || '0x0');
    const effectiveGasPrice = BigInt(receipt.effectiveGasPrice || tx.gasPrice || '0x0');
    const feeWei = gasUsed * effectiveGasPrice;
    const feeEth = ethers.formatEther(feeWei);
    const valueEth = ethers.formatEther(tx.value || '0x0');
    const blockNumber = parseInt(tx.blockNumber || '0x0', 16);
    const statusStr = receipt.status === '0x1' ? 'Success' : 'Failed';

    let parsed: { method?: string; riskLevel?: string; explanation?: string; redFlags?: string[] } = {
      method: 'Transfer',
      riskLevel: 'Low',
      explanation: 'Standard transaction.',
      redFlags: [],
    };
    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: `You are an elite smart contract auditor AI. Analyze raw transaction data. Return ONLY JSON format:
{
  "method": "Transfer or Approve or Swap",
  "riskLevel": "Low or Medium or High",
  "explanation": "Detailed chat-like explanation of safety",
  "redFlags": ["list of flags"]
}`,
        prompt: `Analyze Ethereum Transaction:
Hash: ${val}
Block: ${blockNumber}
From: ${tx.from}
To: ${tx.to}
Value: ${valueEth} ETH
Fee: ${feeEth} ETH
Status: ${statusStr}
Input Data: ${(tx.input || '0x').substring(0, 100)}`,
      });
      parsed = parseJsonFromText(text) as typeof parsed;
    } catch (e) {
      console.warn('AI analysis fallback used for transaction:', e);
    }

    const riskScore = parsed.riskLevel === 'High' ? 85 : parsed.riskLevel === 'Medium' ? 50 : 15;
    const secStatus: StructuredAnalysisResult['status'] = riskScore >= 75 ? 'critical' : riskScore >= 40 ? 'warning' : 'safe';

    const legacyFormat = {
      type: 'transaction' as const,
      txDetails: {
        method: parsed.method || 'Transfer',
        block: blockNumber,
        age: 'Recently',
        from: tx.from,
        to: tx.to || 'Contract Creation',
        amount: `${parseFloat(valueEth).toFixed(6)} ETH`,
        txnFee: `${parseFloat(feeEth).toFixed(6)} ETH`,
      },
      chatAnalysis: {
        riskLevel: parsed.riskLevel || 'Low',
        explanation: parsed.explanation || 'Transaction analyzed successfully.',
        redFlags: parsed.redFlags || [],
      },
    };

    return {
      status: secStatus,
      riskScore,
      confidence: 95,
      summary: parsed.explanation || `Analyzed transaction ${val.substring(0, 10)}... (${statusStr})`,
      recommendation: riskScore > 50 ? 'Exercise caution when interacting with counterparty addresses.' : 'Transaction appears standard.',
      details: {
        hash: val,
        blockNumber,
        from: tx.from,
        to: tx.to,
        valueEth,
        feeEth,
        status: statusStr,
        method: parsed.method,
      },
      insights: parsed.redFlags?.length ? parsed.redFlags : ['Transaction executed with confirmed block receipt.'],
      rawLegacyData: legacyFormat,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'RPC error';
    return {
      status: 'warning',
      riskScore: 50,
      confidence: 70,
      summary: 'Transaction analysis encountered an RPC error.',
      recommendation: 'Retry analysis or inspect block explorer directly.',
      details: { error: errMessage },
      insights: [errMessage],
      rawLegacyData: {
        type: 'transaction',
        overview: { hash: req.txHash || 'Unknown', blockNumber: 'Unknown', network: 'Ethereum', timestamp: 'Unknown', status: 'Failed' },
        details: { from: 'Unknown', to: 'Unknown', value: 'Unknown', fee: 'Unknown', gasUsed: 'Unknown' },
        securityAlerts: { level: 'Unknown Risk', title: 'Analysis Failed', reason: errMessage, recommendation: 'Try again later' },
        aiExplanation: errMessage,
      }
    };
  }
}
