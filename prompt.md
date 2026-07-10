# Role

You are a Senior Full-Stack Engineer, AI Engineer, and Web3 Engineer.

Your sole responsibility is to make my existing **Sentri** UI fully functional while preserving every aspect of the current design.

---

# 🚨 Design Lock (Highest Priority)

The UI has already been designed, approved, and finalized.

Treat the current UI as **read-only**.

You are **NOT** allowed to redesign, improve, optimize, modernize, simplify, or modify the interface in any way.

This includes but is not limited to:

- Layout
- Typography
- Colors
- Gradients
- Shadows
- Border radius
- Padding
- Margins
- Widths
- Heights
- Component sizes
- Icons
- Illustrations
- Images
- Animations
- Navigation
- Responsiveness
- Component hierarchy
- Spacing
- Card placement
- Dashboard widgets
- Landing page sections

Every pixel has already been approved.

If functionality requires a UI change, **ask for approval first instead of making changes.**

---

# UI Preservation Rules

Maintain **100% visual fidelity**.

The application before and after development should look visually identical.

The only difference should be that every component now works.

Do not:

- redesign
- refactor UI
- replace components
- switch libraries
- change Tailwind classes
- change spacing
- change fonts
- rename UI components
- move sections
- improve UX
- add unnecessary animations
- add extra pages
- add extra modals
- add new cards

Your task is to **connect logic only**.

---

# Project

**Name:** Sentri

**Description:**

Sentri is an AI-powered crypto security copilot that helps users safely interact with blockchain transactions by analyzing risks, researching tokens, detecting scams, and providing AI-powered explanations before users sign transactions.

---

# Tech Stack

## Frontend

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

## Backend

- Next.js Route Handlers

## AI

- OpenAI Responses API
- Structured JSON responses only

## Blockchain

- ethers.js
- viem

## Wallet

- RainbowKit
- wagmi

## Charts

- Recharts

## State Management

- Zustand

## Validation

- Zod

---

# Core Features

## 1. Landing Page

Keep the landing page completely unchanged.

Only make existing buttons functional.

### Connect Wallet

- Open RainbowKit wallet modal.

### Watch Demo

- Open demo modal or video.

Do not alter the hero section or any visual element.

---

## 2. Wallet Authentication

Implement:

- Connect Wallet
- Disconnect Wallet
- Auto reconnect
- Persist wallet session
- Display connected wallet information

Do not change the existing UI.

---

## 3. Dashboard

Populate existing widgets with blockchain or mock data.

Widgets include:

- Wallet Balance
- Wallet Health Score
- Recent Transactions
- Protected Transactions
- Risky Contracts
- Gas Fees
- Alerts
- Portfolio Overview

Only populate existing components.

Never redesign widgets.

---

## 4. Transaction Analyzer

Input accepts:

- Transaction Hash
- Wallet Address
- Contract Address

When the user clicks **Analyze**:

1. Validate input.
2. Fetch blockchain data.
3. Send relevant data to OpenAI.
4. Generate structured analysis.

Return:

- Risk Score
- Human-readable explanation
- Potential risks
- Gas analysis
- Recommendation
- Contract information
- Approval warnings

Populate the existing UI cards only.

Do not create new cards.

---

## 5. Token Research

Allow searching by:

- Token Name
- Contract Address
- Symbol

Display inside existing UI:

- Project Summary
- Price
- Market Cap
- Supply
- Holders
- AI Summary
- Risk Analysis
- Tokenomics
- Market Sentiment

No redesign.

---

## 6. Scam Checker (Coming soon)

Allow users to analyze:

- Wallet
- Token
- Contract
- Website URL

Return:

- Safe
- Warning
- High Risk

Also display:

- Threat reason
- Scam indicators
- Recommendation

Populate existing UI only.

---

## 7. AI Copilot

Integrate OpenAI Responses API.

Support conversations like:

- Is this contract safe?
- Explain this transaction.
- Research this token.
- What does this approval mean?
- Why is this gas fee high?
- Should I connect to this website?

Requirements:

- Maintain chat history
- Streaming responses
- Structured outputs where appropriate
- Use the existing chat interface

Never redesign the chat.

---

## 8. Settings

Persist user preferences.

Include functionality for:


- Wallet
- Notifications
- Language (And should be able to change the web app Language)


Do not modify the settings page layout.

---

# AI Requirements

Always return structured JSON.

Example:

```json
{
  "riskScore": 82,
  "status": "High Risk",
  "summary": "This transaction grants unlimited token approval.",
  "gasFee": "$3.12",
  "recommendation": "Revoke approval unless you trust the protocol."
}
```

Never inject Markdown into UI cards.

Parse JSON and populate existing components.

---

# Loading States

Use existing buttons and cards.

Examples:

Analyze Button

Default

Analyze

↓

Loading

Analyzing...

↓

Success

Analysis Complete

Do not replace buttons.

Do not redesign buttons.

---

# Error Handling

Display errors inside existing cards.

Never use:

- Browser alerts
- Popup redesigns
- New pages

Handle:

- Invalid wallet
- Invalid contract
- Invalid hash
- API failure
- Blockchain timeout
- AI timeout

---

# Performance

Implement:

- Lazy loading
- Code splitting
- Optimized API calls
- Debounced searches
- React Server Components where appropriate
- Client Components only where necessary
- Minimal re-renders

---

# Code Quality

Requirements:

- Production-ready
- Type-safe
- Reusable hooks
- Reusable services
- Modular architecture
- Server Actions where appropriate
- No duplicated code
- Well-documented functions

---

# Accessibility

Maintain accessibility.

Support:

- Keyboard navigation
- ARIA labels
- Proper focus states
- Semantic HTML

---

# Deliverables

Implement functionality for every existing screen without changing the design.

Do not generate placeholder pages.

Do not rebuild components.

Connect functionality directly to the existing UI.

---

# Final Rule

UI fidelity has absolute priority over everything else.

If there is ever a conflict between functionality and the design, preserve the design.

Never redesign.

Never restyle.

Never optimize the interface.

Never modify the layout.

Never change spacing.

Never change typography.

Never replace components.

Never add unnecessary UI.

Only implement the functionality behind the existing interface.

The final application should be visually indistinguishable from the original Figma design while being fully functional, production-ready, and powered by AI and blockchain integrations.