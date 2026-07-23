import { NextResponse } from 'next/server';
import { listA2ATasksService, proposeA2ATaskService } from '@/services/a2a-task';
import { A2ATaskProposal } from '@/types/a2a';

export async function GET() {
  const tasks = listA2ATasksService();
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  try {
    const body: A2ATaskProposal = await req.json();
    if (!body.title || !body.clientAddress) {
      return NextResponse.json({ error: 'Missing required proposal fields: title, clientAddress' }, { status: 400 });
    }

    const task = await proposeA2ATaskService(body);
    return NextResponse.json({
      success: true,
      message: 'A2A task proposal accepted by Sentri ASP.',
      task,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to process task proposal';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
