export interface X402PaymentRequest {
  x402: boolean;
  version: string;
  network: string;
  chainId: number;
  recipient: string;
  amount: string;
  currency: string;
  description: string;
  resourceId?: string;
}

export interface X402Headers {
  paymentRequired?: string;
  paymentProof?: string;
  signature?: string;
  chainId?: string;
  payerAddress?: string;
}

export interface X402VerificationResult {
  valid: boolean;
  payerAddress?: string;
  txHash?: string;
  error?: string;
}
