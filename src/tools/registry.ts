import { analyzeTransactionService } from '@/services/transaction';
import { analyzeWalletService } from '@/services/wallet';
import { analyzeContractService } from '@/services/contract';
import { researchTokenService } from '@/services/token';
import { securityCheckService } from '@/services/security';

export const TOOL_REGISTRY = {
  analyze_transaction: analyzeTransactionService,
  analyze_wallet: analyzeWalletService,
  analyze_contract: analyzeContractService,
  research_token: researchTokenService,
  security_check: securityCheckService,
};
