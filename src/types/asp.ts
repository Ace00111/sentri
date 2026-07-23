export type ASPServiceType = 'A2MCP' | 'A2A';

export interface ASPToolParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface ASPToolDefinition {
  name: string;
  description: string;
  endpoint: string;
  pricing: {
    type: 'free' | 'pay-per-call';
    amount?: string;
    currency?: string;
  };
  parameters: ASPToolParameter[];
}

export interface A2AServiceDefinition {
  id: string;
  title: string;
  description: string;
  pricing: {
    type: 'negotiated' | 'fixed';
    defaultAmount?: string;
    currency: string;
  };
  escrowRequired: boolean;
  estimatedTurnaround: string;
}

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  protocol: 'x402';
  network: {
    chain: string;
    chainId: number;
    rpcUrl?: string;
  };
  author: string;
  identityAddress?: string;
  capabilities: string[];
}

export interface ASPManifest {
  schemaVersion: string;
  agent: AgentMetadata;
  services: {
    a2mcp: ASPToolDefinition[];
    a2a: A2AServiceDefinition[];
  };
  x402Config: {
    enabled: boolean;
    payToAddress: string;
    supportedTokens: string[];
    chainId: number;
  };
}
