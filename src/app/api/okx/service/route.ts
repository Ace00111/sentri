import { NextResponse } from 'next/server';
import { createX402PaymentResponse } from '@/lib/x402/middleware';
import { analyzeTransactionService } from '@/services/transaction';
import { researchTokenService } from '@/services/token';
import { securityCheckService } from '@/services/security';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const simulateX402 = req.headers.get('x-simulate-x402') === 'true';
    if (simulateX402) {
      return createX402PaymentResponse({
        amount: '0.001',
        currency: 'OKB',
        description: 'Sentri Premium Security Audit Challenge',
      });
    }

    const body = await req.json();
    const { action, target } = body || {};

    if (!action || !target) {
      return NextResponse.json({ error: 'Missing action or target' }, { status: 400 });
    }

    let report: unknown;
    if (action === 'analyze') {
      report = await analyzeTransactionService({ txHash: target });
    } else if (action === 'research') {
      report = await researchTokenService({ query: target });
    } else {
      report = await securityCheckService({ target });
    }

    return NextResponse.json({
      status: 'success',
      provider: 'Sentri ASP',
      action,
      target,
      report,
    });
  } catch (error: unknown) {
    console.error('OKX Service Error:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
