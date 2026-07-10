'use client'

export default function ScamChecker() {
  return (
    <div className="flex-1 flex flex-col min-w-0 items-center justify-center h-full pt-20" data-purpose="main-layout">
      {/* Title */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Scam Checker</h1>
        <p className="text-mutedText">The ultimate smart contract security scanner.</p>
      </header>

      {/* BEGIN: HeroCard */}
      <div className="bg-surface border border-white/5 rounded-3xl p-12 mb-8 flex flex-col items-center justify-center max-w-xl text-center" data-purpose="token-hero-card">
        <div className="w-20 h-20 bg-sentriGreen/10 rounded-full flex items-center justify-center text-sentriGreen mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-mutedText leading-relaxed">
          We are currently training our AI models on millions of malicious contracts. 
          Soon, you'll be able to instantly scan any token, NFT, or protocol for honeypots, rug pulls, and hidden backdoors.
        </p>
      </div>
      {/* END: HeroCard */}

    </div>
  )
}
