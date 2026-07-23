export type SecurityStatus = 'safe' | 'warning' | 'critical' | 'info';

export interface StructuredAnalysisResult {
  status: SecurityStatus;
  riskScore: number; // 0 (safe) to 100 (critical risk)
  confidence: number; // 0 to 100%
  summary: string;
  recommendation: string;
  details: Record<string, unknown>;
  insights: string[];
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionAnalysisRequest {
  txHash?: string;
  rawTx?: string;
  chainId?: number;
  from?: string;
  to?: string;
  data?: string;
  value?: string;
}

export interface WalletAnalysisRequest {
  address: string;
  chainId?: number;
  includeTokens?: boolean;
}

export interface ContractAnalysisRequest {
  address: string;
  sourceCode?: string;
  bytecode?: string;
  chainId?: number;
}

export interface TokenResearchRequest {
  tokenAddress?: string;
  symbol?: string;
  chainId?: number;
}

export interface SecurityCheckRequest {
  target: string;
  type?: 'address' | 'url' | 'domain' | 'contract' | 'auto';
  chainId?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CopilotChatRequest {
  messages: ChatMessage[];
  context?: Record<string, unknown>;
}
