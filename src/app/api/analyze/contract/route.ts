import { NextResponse } from 'next/server';
import { createX402PaymentResponse, parseX402Headers } from '@/lib/x402/middleware';
import { verifyX402Payment } from '@/lib/x402/verifier';
import { analyzeContractService } from '@/services/contract';

export async function POST(req: Request) {
  const headers = parseX402Headers(req.headers);

  if (headers.paymentRequired === 'true' && !headers.paymentProof) {
    return createX402PaymentResponse({
      amount: '0.002',
      currency: 'OKB',
      description: 'Sentri Smart Contract Audit Fee',
    });
  }

  const verification = await verifyX402Payment(headers, '0.002');
  if (!verification.valid && headers.paymentProof) {
    return NextResponse.json({ error: verification.error }, { status: 402 });
  }

  try {
    const body = await req.json();
    const result = await analyzeContractService(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Contract analysis failed';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
