import { NextResponse } from 'next/server';
import { deliverA2ATaskService } from '@/services/a2a-task';
import { A2ADeliverySubmission } from '@/types/a2a';

export async function POST(req: Request) {
  try {
    const body: A2ADeliverySubmission = await req.json();
    if (!body.taskId || !body.summary) {
      return NextResponse.json({ error: 'Missing required delivery fields: taskId, summary' }, { status: 400 });
    }

    const task = await deliverA2ATaskService(body);
    return NextResponse.json({
      success: true,
      message: 'Deliverable submitted. Escrow payout ready upon client approval.',
      task,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to submit delivery';
    return NextResponse.json({ error: errMessage }, { status: 400 });
  }
}
