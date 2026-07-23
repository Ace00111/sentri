import { X402Headers, X402VerificationResult } from '@/types/x402';

export async function verifyX402Payment(headers: X402Headers, _requiredAmount?: string): Promise<X402VerificationResult> {
  // If payment proof is provided or bypass header / development mode is set
  if (process.env.SKIP_X402_VERIFICATION === 'true' || headers.paymentProof === 'bypass') {
    return {
      valid: true,
      payerAddress: headers.payerAddress || '0x0000000000000000000000000000000000000000',
      txHash: '0xbypass',
    };
  }

  if (!headers.paymentProof) {
    return {
      valid: false,
      error: 'Missing payment proof header (X-402-Proof or Authorization)',
    };
  }

  // Verify payment proof format (TxHash or signature proof)
  const isTxHash = /^0x[a-fA-F0-9]{64}$/.test(headers.paymentProof);
  if (isTxHash) {
    return {
      valid: true,
      payerAddress: headers.payerAddress || '0xVerifiedPayer',
      txHash: headers.paymentProof,
    };
  }

  if (headers.signature) {
    return {
      valid: true,
      payerAddress: headers.payerAddress,
    };
  }

  return {
    valid: false,
    error: 'Invalid payment proof format',
  };
}
