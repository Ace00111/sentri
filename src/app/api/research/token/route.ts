import { NextResponse } from 'next/server';
import { researchTokenService } from '@/services/token';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await researchTokenService(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Token research failed';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
