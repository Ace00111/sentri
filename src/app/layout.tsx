import type { Metadata } from 'next'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Sentri | Your AI Copilot for Safer Crypto Decisions',
  description: 'Analyze transactions, detect scams, research tokens, and protect your wallet with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased text-white font-sans bg-darkBg">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
