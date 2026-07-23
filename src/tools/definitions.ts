import { z } from 'zod';

export const TransactionAnalysisSchema = z.object({
  txHash: z.string().describe('The 66-character 0x transaction hash to analyze'),
  chainId: z.number().optional().describe('EVM Chain ID'),
});

export const WalletAnalysisSchema = z.object({
  address: z.string().describe('The 42-character 0x EVM wallet address to audit'),
  chainId: z.number().optional().describe('EVM Chain ID'),
});

export const ContractAnalysisSchema = z.object({
  address: z.string().describe('The 42-character 0x smart contract address'),
  sourceCode: z.string().optional(),
  bytecode: z.string().optional(),
});

export const TokenResearchSchema = z.object({
  query: z.string().describe('Token ticker symbol or contract address'),
  chartDays: z.number().optional().default(1),
});

export const SecurityCheckSchema = z.object({
  target: z.string().describe('Address, domain URL, or transaction hash'),
  type: z.enum(['address', 'url', 'domain', 'contract', 'auto']).optional().default('auto'),
});
