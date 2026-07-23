import { NextResponse } from 'next/server';
import { getSentriASPManifest } from '@/agents/sentri';

export async function GET() {
  const manifest = getSentriASPManifest();
  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'X-ASP-Protocol': 'x402',
    },
  });
}
