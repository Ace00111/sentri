import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { analyzeTransactionService } from '@/services/transaction';
import { analyzeWalletService } from '@/services/wallet';

export const maxDuration = 60;

export async function POST(req: Request) {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const { hash, input } = await req.json();
    const val = (input || hash || '').trim();

    if (!val || typeof val !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
    }

    const isAddress = ethers.isAddress(val);
    const isTx = val.length === 66 && val.startsWith('0x');

    if (!isAddress && !isTx) {
      return NextResponse.json({ error: 'Invalid Ethereum address or transaction hash' }, { status: 400 });
    }

    if (isTx) {
      const result = await analyzeTransactionService({ txHash: val });
      if (result.rawLegacyData) {
        return NextResponse.json(result.rawLegacyData);
      }
      return NextResponse.json(result);
    }

    if (isAddress) {
      const result = await analyzeWalletService({ address: val });
      if (result.rawLegacyData) {
        return NextResponse.json(result.rawLegacyData);
      }
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    const errObj = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    console.error(`[API ERROR] Route: /api/analyze | Request ID: ${reqId} | Service: AnalyzeService`, errObj);
    return NextResponse.json({ error: 'Failed to analyze input' }, { status: 500 });
  }
}
