'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      {/* BEGIN: Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-darkBg/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center">
              <img src="/logo.jpg" alt="Sentri Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <span className="text-xl font-bold tracking-tight">Sentri</span>
          </div>
          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textSecondary">
            <a className="hover:text-brand transition-colors" href="#features">Features</a>
            <a className="hover:text-brand transition-colors" href="#security">Security</a>
            <a className="hover:text-brand transition-colors" href="/doc.html">Docs</a>
          </div>
          {/* Auth */}
          <div className="flex items-center gap-4">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted
                const connected = ready && account && chain
                return (
                  <div className="flex items-center gap-4" {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                    {!connected && (
                      <button onClick={openConnectModal} className="text-sm font-medium hover:text-brand transition-colors px-4">Log in</button>
                    )}
                    {(() => {
                      if (!connected) {
                        return (
                          <button onClick={openConnectModal} type="button" className="bg-brand text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                            Get Started
                          </button>
                        )
                      }
                      if (chain.unsupported) {
                        return (
                          <button onClick={openChainModal} type="button" className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                            Wrong network
                          </button>
                        )
                      }
                      return (
                        <button onClick={openAccountModal} type="button" className="bg-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">
                          {account.displayName}
                        </button>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>
      {/* END: Navigation */}

      {/* BEGIN: HeroSection */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div data-purpose="hero-text-content">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6">
              Your AI Copilot <br /> for <span className="text-brand">Safer</span> Crypto <br /> Decisions.
            </h1>
            <p className="text-lg text-textSecondary max-w-lg mb-10 leading-relaxed">
              Analyze transactions, detect scams, research tokens, and protect your wallet with AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain
                  return (
                    <button 
                      onClick={connected ? () => window.location.href = '/dashboard' : openConnectModal}
                      className="flex items-center gap-2 bg-brand text-black px-6 py-3.5 rounded-lg font-bold hover:scale-[1.02] transition-transform"
                    >
                      <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                      </svg>
                      {connected ? 'Go to Dashboard' : 'Connect Wallet'}
                    </button>
                  )
                }}
              </ConnectButton.Custom>
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3.5 rounded-lg font-bold transition-colors">
                <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
                  <path d="m7 4 12 8-12 8V4z"></path>
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
          {/* Right: Illustration */}
          <div className="relative flex justify-center items-center" data-purpose="hero-visual">
            <div className="hero-glow absolute w-[500px] h-[500px] rounded-full"></div>
            {/* UI Elements Mockup */}
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Main Diamond */}
              <div className="w-32 h-32 bg-brand rotate-45 rounded-2xl shadow-[0_0_50px_rgba(183,255,0,0.4)] flex items-center justify-center">
                <div className="-rotate-45">
                  <svg fill="none" height="40" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="40">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
              </div>
              {/* Floating Status 1 */}
              <div className="absolute top-0 right-0 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3">
                <div className="text-xs">
                  <div className="text-textSecondary uppercase tracking-widest text-[10px]">Wallet Health</div>
                  <div className="text-brand font-bold text-lg leading-none mt-1">92<span className="text-white/30 text-xs">/100</span></div>
                </div>
              </div>
              {/* Floating Status 2 */}
              <div className="absolute top-10 left-0 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand"></div>
                <span className="text-[10px] font-medium tracking-wide">Transaction Protected</span>
              </div>
              {/* Floating Status 3 */}
              <div className="absolute bottom-10 right-4 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <svg fill="none" height="12" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24" width="12">
                  <path d="m12 13 2-2 2 2-2 2Z"></path>
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path>
                  <path d="m12 8-1 1v4h2v-4l-1-1Z"></path>
                </svg>
                <span className="text-[10px] font-bold text-orange-500">Risks Detected <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded ml-1">2</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: StatsBar */}
      <section className="border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">300K+</div>
            <div className="text-sm text-textSecondary">Transactions Analyzed</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">1K+</div>
            <div className="text-sm text-textSecondary">Wallets Protected</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1 text-brand">95.6%</div>
            <div className="text-sm text-textSecondary">Detection Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">24/7</div>
            <div className="text-sm text-textSecondary">AI Protection</div>
          </div>
        </div>
      </section>
      {/* END: StatsBar */}

      {/* BEGIN: FeaturesSection */}
      <section className="py-32" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold">Everything you need to trade safely</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-cardBg p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-6 text-brand">
                <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Transaction Analyzer</h3>
              <p className="text-textSecondary text-sm leading-relaxed">
                Explain every transaction before signing.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-cardBg p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-6 text-brand">
                <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Token Research</h3>
              <p className="text-textSecondary text-sm leading-relaxed">
                AI-powered insights into any crypto asset.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-cardBg p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-6 text-brand">
                <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Scam Detection</h3>
              <p className="text-textSecondary text-sm leading-relaxed">
                Detect phishing websites, malicious contracts, and fake tokens.
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-cardBg p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-6 text-brand">
                <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Copilot</h3>
              <p className="text-textSecondary text-sm leading-relaxed">
                Ask anything about crypto security.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: FeaturesSection */}

      {/* BEGIN: SecuritySection */}
      <section className="py-32 bg-darkBg" id="security">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-brand uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Security</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built on a security-first foundation</h2>
            <p className="text-textSecondary text-lg leading-relaxed">
              Sentri never holds your keys or funds. Every analysis runs against verified on-chain data and audited smart contract sources, so recommendations stay accurate and your wallet stays fully in your control.
            </p>
          </div>
          <div className="space-y-4">
            {/* List Item 1 */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-5 rounded-xl">
              <div className="text-brand">
                <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
                  <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="font-medium">Non-custodial, we never hold your keys</span>
            </div>
            {/* List Item 2 */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-5 rounded-xl">
              <div className="text-brand">
                <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
                  <path d="M2 12c0-4.4 3.6-8 8-8 2 0 3.8.7 5.3 2L12 9h9V0l-2.6 2.6A11.9 11.9 0 0 0 2 12Z"></path>
                </svg>
              </div>
              <span className="font-medium">Real-time contract and phishing detection</span>
            </div>
            {/* List Item 3 */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-5 rounded-xl">
              <div className="text-brand">
                <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
                  <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="font-medium">End-to-end encrypted analysis, always</span>
            </div>
          </div>
        </div>
      </section>
      {/* END: SecuritySection */}

      {/* BEGIN: HowItWorks */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand uppercase tracking-[0.2em] text-xs font-bold mb-4 block">How it works</span>
            <h2 className="text-4xl md:text-5xl font-bold">Protected in four simple steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-cardBg p-10 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="text-6xl font-black step-number mb-6 group-hover:text-brand/20 transition-colors">01</div>
              <h3 className="text-lg font-bold">Connect Wallet</h3>
            </div>
            {/* Step 2 */}
            <div className="bg-cardBg p-10 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="text-6xl font-black step-number mb-6 group-hover:text-brand/20 transition-colors">02</div>
              <h3 className="text-lg font-bold">Analyze Transaction</h3>
            </div>
            {/* Step 3 */}
            <div className="bg-cardBg p-10 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="text-6xl font-black step-number mb-6 group-hover:text-brand/20 transition-colors">03</div>
              <h3 className="text-lg font-bold">Receive AI Insights</h3>
            </div>
            {/* Step 4 */}
            <div className="bg-cardBg p-10 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="text-6xl font-black step-number mb-6 group-hover:text-brand/20 transition-colors">04</div>
              <h3 className="text-lg font-bold">Trade Safely</h3>
            </div>
          </div>
        </div>
      </section>
      {/* END: HowItWorks */}

      {/* BEGIN: CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-cardBg border border-white/5 rounded-[40px] py-20 px-8 text-center relative overflow-hidden">
            {/* Subtle Glow */}
            <div className="absolute inset-0 hero-glow opacity-50 pointer-events-none"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Start making safer crypto decisions today</h2>
            <p className="text-textSecondary mb-10 max-w-xl mx-auto relative z-10">
              Join hundreds of thousands of traders protected by Sentri's AI.
            </p>
            <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain
                  return (
                    <button 
                      onClick={connected ? () => window.location.href = '/dashboard' : openConnectModal}
                      className="flex items-center gap-2 bg-brand text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform mx-auto relative z-10"
                    >
                      <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                      </svg>
                      {connected ? 'Go to Dashboard' : 'Connect Wallet'}
                    </button>
                  )
                }}
              </ConnectButton.Custom>
          </div>
        </div>
      </section>
      {/* END: CTA */}

      {/* BEGIN: Footer */}
      <footer className="pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            {/* Brand Info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                  <img src="/logo.jpg" alt="Sentri Logo" className="w-full h-full object-contain rounded" />
                </div>
                <span className="text-lg font-bold">Sentri</span>
              </div>
              <p className="text-sm text-textSecondary leading-relaxed">
                Your AI Copilot for Safer Crypto Decisions.
              </p>
            </div>
            {/* Links Groups */}
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-textSecondary">
                <li><a className="hover:text-brand transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-brand transition-colors" href="#">Security</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Docs</h4>
              <ul className="space-y-4 text-sm text-textSecondary">
                <li>X</li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Privacy</h4>
              <ul className="space-y-4 text-sm text-textSecondary">
                <li><a className="hover:text-brand transition-colors" href="#">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-xs text-textSecondary flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 Sentri. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </>
  )
}
