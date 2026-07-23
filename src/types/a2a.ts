export type A2ATaskStatus = 
  | 'proposed' 
  | 'negotiating' 
  | 'accepted' 
  | 'funded' 
  | 'in_progress' 
  | 'delivered' 
  | 'completed' 
  | 'disputed' 
  | 'rejected';

export interface A2ATaskProposal {
  title: string;
  description: string;
  serviceId: string;
  clientAddress: string;
  offeredBounty: string;
  currency: string;
  deadline?: string;
  requirements?: Record<string, unknown>;
}

export interface A2ATask {
  id: string;
  proposal: A2ATaskProposal;
  status: A2ATaskStatus;
  aspAddress: string;
  escrowContractAddress?: string;
  agreedPrice: string;
  currency: string;
  deliverable?: {
    summary: string;
    reportUrl?: string;
    reportData?: Record<string, unknown>;
    signature?: string;
    timestamp: string;
  };
  dispute?: {
    reason: string;
    clientStatement?: string;
    aspStatement?: string;
    filedAt: string;
    status: 'pending' | 'resolved_asp' | 'resolved_client';
  };
  createdAt: string;
  updatedAt: string;
}

export interface A2ADeliverySubmission {
  taskId: string;
  aspAddress: string;
  summary: string;
  reportData: Record<string, unknown>;
  signature: string;
}

export interface A2ADisputeSubmission {
  taskId: string;
  aspAddress: string;
  reason: string;
  statement: string;
  depositTxHash: string; // 5% bounty deposit
}
