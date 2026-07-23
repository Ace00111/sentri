import { NextResponse } from 'next/server';
import { createX402PaymentResponse, parseX402Headers } from '@/lib/x402/middleware';
import { verifyX402Payment } from '@/lib/x402/verifier';
import { analyzeTransactionService } from '@/services/transaction';

export async function POST(req: Request) {
  const headers = parseX402Headers(req.headers);

  if (headers.paymentRequired === 'true' && !headers.paymentProof) {
    return createX402PaymentResponse({
      amount: '0.001',
      currency: 'OKB',
      description: 'Sentri Transaction Security Audit Fee',
    });
  }

  const verification = await verifyX402Payment(headers, '0.001');
  if (!verification.valid && headers.paymentProof) {
    return NextResponse.json({ error: verification.error }, { status: 402 });
  }

  try {
    const body = await req.json();
    const result = await analyzeTransactionService(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Transaction analysis failed';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
