import { runCopilotChatService } from '@/services/copilot';

export const maxDuration = 30;

export async function POST(req: Request) {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const { messages } = await req.json();
    return runCopilotChatService({ messages });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    console.error(`[API ERROR] Route: /api/chat | Request ID: ${reqId} | Service: CopilotChatService`, errObj);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
