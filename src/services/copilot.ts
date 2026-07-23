import { groq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getOkxClient } from '@/utils/okx';
import { CopilotChatRequest } from '@/types/analysis';

export function runCopilotChatService(req: CopilotChatRequest) {
  if (!process.env.GROQ_API_KEY) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('0:"API Key Missing. Please set GROQ_API_KEY in your .env.local file to use the AI Copilot."\n'));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'x-vercel-ai-data-stream': 'v1' } });
  }

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: req.messages,
    system: `You are Sentri, a crypto security assistant integrated with OKX Onchain OS and x402 protocol architecture. 
Your job is to analyze wallet addresses, transactions, or smart contracts provided by the user. 
You can query live market data for tokens via OKX SDK. 
You help users understand transaction behavior and warn them about honeypots, rug pulls, or malicious allowances. 
Be concise, security-focused, data-driven, and highly helpful.`,
    tools: {
      getMarketData: tool({
        description: 'Get live market data for a token from OKX. Pass the token symbol (e.g. BTC, ETH, OKB).',
        inputSchema: z.object({
          symbol: z.string().describe('The token symbol, e.g. BTC, ETH'),
        }),
        execute: async ({ symbol }: { symbol: string }): Promise<Record<string, unknown>> => {
          try {
            const instId = `${symbol.toUpperCase()}-USDT`;
            const client = getOkxClient();
            if (!client) return { error: 'OKX SDK client not configured.' };

            const data = await client.getTicker({ instId });
            if (data && data.length > 0) {
              const tick = data[0];
              return {
                symbol: symbol.toUpperCase(),
                price: parseFloat(tick.last),
                vol24h: parseFloat(tick.vol24h),
                open24h: parseFloat(tick.open24h),
              };
            }
            return { error: 'Token market data not found on OKX.' };
          } catch {
            return { error: 'Failed to fetch market data from OKX SDK.' };
          }
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}
