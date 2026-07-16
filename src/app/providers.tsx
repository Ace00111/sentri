'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, base, arbitrum, optimism } from 'wagmi/chains'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: 'Sentri',
  projectId: '3fcc6bba6f1de962d911bb5b5c3dba68', // Public dummy project ID for demo
  chains: [mainnet, base, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#B7FF00',
          accentColorForeground: 'black',
          borderRadius: 'medium',
        })}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
