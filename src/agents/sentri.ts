import { ASPManifest } from '@/types/asp';

export const SENTRI_AGENT_METADATA = {
  id: 'sentri-asp-v1',
  name: 'Sentri',
  description: 'An AI-powered blockchain security copilot that analyzes blockchain transactions, researches wallets and contracts, explains smart contract interactions, detects scams, and provides security recommendations.',
  version: '1.0.0',
  protocol: 'x402' as const,
  network: {
    chain: 'xlayer',
    chainId: 196, // XLayer Mainnet
    rpcUrl: 'https://rpc.xlayer.tech',
  },
  author: 'Sentri Security',
  identityAddress: process.env.OKX_ASP_PAYMENT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  capabilities: [
    'Transaction Analysis',
    'Wallet Analysis',
    'Contract Analysis',
    'Token Research',
    'Scam Detection',
    'Security Recommendations',
    'AI Copilot',
  ],
};

export function getSentriASPManifest(): ASPManifest {
  return {
    schemaVersion: '1.0.0',
    agent: SENTRI_AGENT_METADATA,
    services: {
      a2mcp: [
        {
          name: 'analyze_transaction',
          description: 'Analyze Ethereum or XLayer transaction hash for risks and security red flags.',
          endpoint: '/api/analyze/transaction',
          pricing: { type: 'pay-per-call', amount: '0.001', currency: 'OKB' },
          parameters: [
            { name: 'txHash', type: 'string', description: '66-character 0x transaction hash', required: true },
            { name: 'chainId', type: 'number', description: 'Network chain ID (default: 1 for ETH, 196 for XLayer)', required: false },
          ],
        },
        {
          name: 'analyze_wallet',
          description: 'Audit wallet portfolio, transaction history, and security risk profile.',
          endpoint: '/api/analyze/wallet',
          pricing: { type: 'pay-per-call', amount: '0.001', currency: 'OKB' },
          parameters: [
            { name: 'address', type: 'string', description: '42-character 0x wallet address', required: true },
          ],
        },
        {
          name: 'analyze_contract',
          description: 'Audit EVM smart contract bytecode, vulnerability markers, and ownership privileges.',
          endpoint: '/api/analyze/contract',
          pricing: { type: 'pay-per-call', amount: '0.002', currency: 'OKB' },
          parameters: [
            { name: 'address', type: 'string', description: '42-character 0x contract address', required: true },
          ],
        },
        {
          name: 'research_token',
          description: 'Fetch token market metrics, holder concentration, and contract security checks.',
          endpoint: '/api/research/token',
          pricing: { type: 'free' },
          parameters: [
            { name: 'query', type: 'string', description: 'Token symbol or contract address', required: true },
          ],
        },
        {
          name: 'security_check',
          description: 'Check address, domain URL, or contract against scam & drainer database.',
          endpoint: '/api/security/check',
          pricing: { type: 'free' },
          parameters: [
            { name: 'target', type: 'string', description: 'Target address or URL to verify', required: true },
          ],
        },
        {
          name: 'ai_copilot',
          description: 'Interactive security AI copilot streaming chat endpoint.',
          endpoint: '/api/chat',
          pricing: { type: 'free' },
          parameters: [
            { name: 'messages', type: 'array', description: 'Conversation messages array', required: true },
          ],
        },
      ],
      a2a: [
        {
          id: 'a2a_smart_contract_audit',
          title: 'Comprehensive Smart Contract Security Audit',
          description: 'Full automated and AI-guided vulnerability audit of smart contract repositories with signed report.',
          pricing: { type: 'negotiated', defaultAmount: '0.05', currency: 'OKB' },
          escrowRequired: true,
          estimatedTurnaround: '1 hour',
        },
      ],
    },
    x402Config: {
      enabled: true,
      payToAddress: SENTRI_AGENT_METADATA.identityAddress,
      supportedTokens: ['OKB', 'USDT'],
      chainId: 196,
    },
  };
}
