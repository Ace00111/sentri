import { NextResponse } from 'next/server';
import { analyzeTransactionService } from '@/services/transaction';
import { researchTokenService } from '@/services/token';
import { securityCheckService } from '@/services/security';

export const maxDuration = 30;

const TOOLS = [
  {
    name: 'analyze_transaction',
    description: 'Analyze an Ethereum/EVM transaction hash or smart contract address for security risks.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Transaction hash (0x...) or address to analyze' }
      },
      required: ['target']
    }
  },
  {
    name: 'research_token',
    description: 'Retrieve real-time security metrics, volume, price trend, and security risk summary for any token.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Token name, symbol, or contract address' }
      },
      required: ['query']
    }
  },
  {
    name: 'scam_check',
    description: 'Check wallet address, smart contract, or dApp domain name for known phishing or security risks.',
    inputSchema: {
      type: 'object',
      properties: {
        addressOrDomain: { type: 'string', description: 'Target address or website domain' }
      },
      required: ['addressOrDomain']
    }
  }
];

interface MCPRequest {
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, string>;
  };
}

export async function POST(req: Request) {
  try {
    const body: MCPRequest = await req.json();
    const { method, params } = body;

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: { tools: TOOLS }
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};

      if (name === 'analyze_transaction') {
        const target = args?.target || '';
        const res = await analyzeTransactionService({ txHash: target });
        return NextResponse.json({
          jsonrpc: '2.0',
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
        });
      }

      if (name === 'research_token') {
        const query = args?.query || '';
        const res = await researchTokenService({ query });
        return NextResponse.json({
          jsonrpc: '2.0',
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
        });
      }

      if (name === 'scam_check') {
        const addressOrDomain = args?.addressOrDomain || '';
        const res = await securityCheckService({ target: addressOrDomain });
        return NextResponse.json({
          jsonrpc: '2.0',
          result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Tool ${name} not found` }
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid method' }
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: errMessage }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Sentri MCP Server Active',
    tools: TOOLS
  });
}
