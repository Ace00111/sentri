# Sentri: Web3 Security & AI Copilot

**Sentri** is an advanced AI Service Provider (ASP) built for the **OKX Onchain OS** hackathon. It combines live market data from OKX, on-chain transaction analysis, and the Groq-powered AI engine to act as your ultimate Web3 security companion.

## Features

- **OKX.AI Integration**: Built specifically to plug into the OKX AI Agent ecosystem using the Model Context Protocol (MCP) and x402 payment requirements (`/api/okx/mcp` and `/api/okx/service`).
- **Live Market Data**: Fully integrated with the official `okx-api` SDK to securely fetch real-time market tickers via HMAC-SHA256 authenticated endpoints.
- **AI Copilot (Powered by Groq)**: Chat natively with Sentri. The agent utilizes tool-calling to fetch OKX market data and answer complex Web3 queries on the fly.
- **Transaction Analyzer**: Paste any Ethereum hash. Sentri parses the raw EVM receipt and uses AI to summarize the risk, gas fees, and underlying intent of the transaction.
- **Dynamic Localization**: Built-in multi-language support synced directly with browser-native notifications and high-fidelity dark-mode UI.
- **Strict Security Preferences**: Locally persisted user thresholds to adapt the strictness of contract audits and honeypot detection.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **AI Generation**: `@ai-sdk/groq` (llama-3.1-8b-instant) + `@ai-sdk/react`
- **Web3 / Data**: `okx-api` (Official OKX SDK), `wagmi`, `viem`, Alchemy RPC
- **Styling**: Tailwind CSS v4, Recharts for dynamic asset tracking

## Getting Started

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure your environment variables in `.env.local`:
```env
# OKX Data

OKX_API_KEY="your-api-key"
OKX_SECRET_KEY="your-secret-key"
OKX_PASSPHRASE="your-passphrase"

# AI & Fallback Web3
GROQ_API_KEY="your-groq-key"
ALCHEMY_API_KEY="your-alchemy-key"
```

3. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view  the application.
" " 
