import { NextResponse } from 'next/server';
import { disputeA2ATaskService } from '@/services/a2a-task';
import { A2ADisputeSubmission } from '@/types/a2a';

export async function POST(req: Request) {
  try {
    const body: A2ADisputeSubmission = await req.json();
    if (!body.taskId || !body.statement) {
      return NextResponse.json({ error: 'Missing required dispute fields: taskId, statement' }, { status: 400 });
    }

    const task = await disputeA2ATaskService(body);
    return NextResponse.json({
      success: true,
      message: 'Dispute escalated to OKX.AI arbitration network. 5% deposit locked.',
      task,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to file dispute';
    return NextResponse.json({ error: errMessage }, { status: 400 });
  }
}
