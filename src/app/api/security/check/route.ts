import { NextResponse } from 'next/server';
import { securityCheckService } from '@/services/security';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await securityCheckService(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Security check failed';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
