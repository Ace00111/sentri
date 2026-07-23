import { NextResponse } from 'next/server';
import { researchTokenService } from '@/services/token';

export const maxDuration = 30;

export async function POST(req: Request) {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const { query, chartDays = 1 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }

    const result = await researchTokenService({ query, chartDays });
    if (result.rawLegacyData) {
      return NextResponse.json(result.rawLegacyData);
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errObj = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    console.error(`[API ERROR] Route: /api/research | Request ID: ${reqId} | Service: ResearchTokenService`, errObj);
    return NextResponse.json({ error: 'Failed to research token.' }, { status: 500 });
  }
}
