import { A2ADeliverySubmission, A2ADisputeSubmission, A2ATask, A2ATaskProposal } from '@/types/a2a';

// In-memory or state storage for A2A task registry
const taskStore = new Map<string, A2ATask>();

export async function proposeA2ATaskService(proposal: A2ATaskProposal): Promise<A2ATask> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const agreedPrice = proposal.offeredBounty || '0.05';
  const currency = proposal.currency || 'OKB';

  const task: A2ATask = {
    id: taskId,
    proposal,
    status: 'accepted',
    aspAddress: process.env.OKX_ASP_PAYMENT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    agreedPrice,
    currency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  taskStore.set(taskId, task);
  return task;
}

export async function deliverA2ATaskService(submission: A2ADeliverySubmission): Promise<A2ATask> {
  const existing = taskStore.get(submission.taskId);
  if (!existing) {
    throw new Error(`A2A Task ID ${submission.taskId} not found.`);
  }

  existing.status = 'delivered';
  existing.deliverable = {
    summary: submission.summary,
    reportData: submission.reportData,
    signature: submission.signature || `sig_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  existing.updatedAt = new Date().toISOString();

  taskStore.set(existing.id, existing);
  return existing;
}

export async function disputeA2ATaskService(dispute: A2ADisputeSubmission): Promise<A2ATask> {
  const existing = taskStore.get(dispute.taskId);
  if (!existing) {
    throw new Error(`A2A Task ID ${dispute.taskId} not found.`);
  }

  existing.status = 'disputed';
  existing.dispute = {
    reason: dispute.reason,
    aspStatement: dispute.statement,
    filedAt: new Date().toISOString(),
    status: 'pending',
  };
  existing.updatedAt = new Date().toISOString();

  taskStore.set(existing.id, existing);
  return existing;
}

export function getA2ATaskService(taskId: string): A2ATask | undefined {
  return taskStore.get(taskId);
}

export function listA2ATasksService(): A2ATask[] {
  return Array.from(taskStore.values());
}
