import { NextResponse } from 'next/server';
import { getSentriASPManifest } from '@/agents/sentri';

export async function GET() {
  const manifest = getSentriASPManifest();
  return NextResponse.json({
    agent: manifest.agent.name,
    protocol: manifest.agent.protocol,
    services: manifest.services,
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
