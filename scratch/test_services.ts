import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
      }
    }
  }
}

import { analyzeTransactionService } from '../src/services/transaction';
import { analyzeWalletService } from '../src/services/wallet';
import { researchTokenService } from '../src/services/token';

async function testAll() {
  console.log('--- TESTING ENV ---');
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Present' : 'MISSING');
  console.log('ALCHEMY_API_KEY:', process.env.ALCHEMY_API_KEY ? 'Present' : 'MISSING');

  console.log('\n--- TESTING WALLET ANALYZE ---');
  try {
    const walletRes = await analyzeWalletService({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' });
    console.log('Wallet Res status:', walletRes.status);
    console.log('Wallet Res rawLegacyData exists:', !!walletRes.rawLegacyData);
    if (walletRes.rawLegacyData) {
      console.log('Wallet Legacy Overview:', (walletRes.rawLegacyData as any).overview);
    }
  } catch (err) {
    console.error('Wallet Analyze Error:', err);
  }

  console.log('\n--- TESTING TX ANALYZE ---');
  try {
    const txRes = await analyzeTransactionService({ txHash: '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060' });
    console.log('Tx Res status:', txRes.status);
    console.log('Tx Res rawLegacyData exists:', !!txRes.rawLegacyData);
    if (txRes.rawLegacyData) {
      console.log('Tx Legacy Details:', (txRes.rawLegacyData as any).txDetails);
    }
  } catch (err) {
    console.error('Tx Analyze Error:', err);
  }

  console.log('\n--- TESTING TOKEN RESEARCH ---');
  try {
    const tokenRes = await researchTokenService({ query: 'ETH' });
    console.log('Token Res status:', tokenRes.status);
    console.log('Token Res rawLegacyData name:', (tokenRes.rawLegacyData as any)?.name);
    console.log('Token Res rawLegacyData price:', (tokenRes.rawLegacyData as any)?.price);
  } catch (err) {
    console.error('Token Research Error:', err);
  }
}

testAll();
