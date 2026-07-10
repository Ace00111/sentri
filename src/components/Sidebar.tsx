'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { href: '/analyze', label: 'Analyze', icon: 'bar_chart' },
    { href: '/research', label: 'Research', icon: 'search' },
    { href: '/scam-checker', label: 'Scam Checker', icon: 'verified_user' },
    { href: '/ai-chat', label: 'AI Chat', icon: 'chat_bubble' },
  ]

  return (
    <aside className="w-64 bg-sidebarBg border-r border-borderGray flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Logo Section */}
      <Link href="/" className="p-6 flex items-center gap-3">
        <img src="/logo.jpg" alt="Sentri Logo" className="h-8 w-auto object-contain" />
        <span className="text-white text-2xl font-bold tracking-tight">Sentri</span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map(link => {
          const isActive = pathname === link.href || (pathname === '/' && link.href === '/dashboard')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#1a1a00] text-sentriGreen font-bold' 
                  : 'text-mutedText hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className={isActive ? '' : 'font-medium'}>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings Bottom */}
      <div className="p-4 mt-auto">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-[#1a1a00] text-sentriGreen font-bold'
              : 'text-mutedText hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className={pathname === '/settings' ? '' : 'font-medium'}>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
