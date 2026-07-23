import { X402Headers } from '@/types/x402';

export function parseX402Headers(headers: Headers): X402Headers {
  return {
    paymentRequired: headers.get('x-402-payment-required') || headers.get('X-402-Payment-Required') || undefined,
    paymentProof: headers.get('x-402-proof') || headers.get('X-402-Proof') || headers.get('authorization')?.replace('Bearer ', '') || undefined,
    signature: headers.get('x-402-signature') || headers.get('X-402-Signature') || undefined,
    chainId: headers.get('x-402-chain-id') || headers.get('X-402-Chain-Id') || '196', // XLayer Mainnet default
    payerAddress: headers.get('x-402-payer') || headers.get('X-402-Payer') || undefined,
  };
}

export function createX402PaymentResponse(params: {
  amount?: string;
  currency?: string;
  description: string;
  resourceId?: string;
}) {
  const paymentPayload = {
    x402: true,
    version: '1.0',
    network: 'xlayer',
    chainId: 196, // XLayer Mainnet
    recipient: process.env.OKX_ASP_PAYMENT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    amount: params.amount || '0.001',
    currency: params.currency || 'OKB',
    description: params.description,
    resourceId: params.resourceId || `sentri_${Date.now()}`,
  };

  return new Response(JSON.stringify(paymentPayload), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-402-Payment-Required': 'true',
      'X-402-Network': 'xlayer',
      'X-402-Chain-Id': '196',
    },
  });
}
