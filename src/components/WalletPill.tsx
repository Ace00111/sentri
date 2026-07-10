'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletPill() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className="bg-cardBg border border-borderGray rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors">
                    <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    <span className="text-sm font-mono text-mutedText">Connect Wallet</span>
                  </button>
                )
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" className="bg-cardBg border border-borderGray rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors">
                    <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    <span className="text-sm font-mono text-red-500">Wrong network</span>
                  </button>
                )
              }
              return (
                <button onClick={openAccountModal} type="button" className="bg-cardBg border border-borderGray rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-sentriGreen shadow-[0_0_8px_rgba(183,255,0,0.8)]"></span>
                  <span className="text-sm font-mono">{account.displayName}</span>
                </button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
