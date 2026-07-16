'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '@/utils/notifications'

export default function Settings() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()

  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('English (US)')

  // Load from local storage
  useEffect(() => {
    const savedNotifs = localStorage.getItem('sentri_notifications')
    if (savedNotifs !== null) setNotifications(savedNotifs === 'true')
    
    const savedLang = localStorage.getItem('sentri_language')
    if (savedLang) setLanguage(savedLang)
  }, [])

  // Save to local storage
  const toggleNotifications = () => {
    const newVal = !notifications
    setNotifications(newVal)
    localStorage.setItem('sentri_notifications', String(newVal))
    if (newVal) {
      requestNotificationPermission()
    }
  }

  const cycleLanguage = () => {
    const langs = ['English (US)', 'Spanish', 'French', 'Japanese']
    const nextIdx = (langs.indexOf(language) + 1) % langs.length
    const newLang = langs[nextIdx]
    setLanguage(newLang)
    localStorage.setItem('sentri_language', newLang)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-10">Settings</h1>
      
      {/* Settings Cards Container */}
      <div className="space-y-4">
        {/* Wallet Connection */}
        <div className="bg-darkBg/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between" data-purpose="setting-wallet">
          <div className="flex items-center gap-4">
            <div className="text-sentriGreen">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Wallet Connection</h3>
              <p className="text-mutedText text-sm">
                {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)} · Connected` : 'Not Connected'}
              </p>
            </div>
          </div>
          {isConnected ? (
            <button 
              onClick={() => disconnect()}
              className="px-6 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={openConnectModal}
              className="px-6 py-2 bg-sentriGreen text-black border border-white/10 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          )}
        </div>

        {/* Language Selection */}
        <div className="bg-darkBg/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between" data-purpose="setting-language">
          <div className="flex items-center gap-4">
            <div className="text-sentriGreen">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            </div>
            <h3 className="font-semibold text-lg">Language</h3>
          </div>
          <div onClick={cycleLanguage} className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-mutedText cursor-pointer hover:bg-white/10 transition-colors select-none">
            {language}
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="bg-darkBg/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between" data-purpose="setting-notifications">
          <div className="flex items-center gap-4">
            <div className="text-sentriGreen">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>
          {/* Toggle Switch */}
          <button 
            onClick={toggleNotifications}
            className={`w-14 h-8 rounded-full relative flex items-center px-1 transition-colors ${notifications ? 'bg-sentriGreen' : 'bg-zinc-700'}`}
          >
            <div className={`w-6 h-6 bg-black rounded-full shadow-md transition-transform ${notifications ? 'ml-auto' : 'mr-auto'}`}></div>
          </button>
        </div>

        {/* Security Preferences */}
        <div className="bg-darkBg/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between" data-purpose="setting-security">
          <div className="flex items-center gap-4">
            <div className="text-sentriGreen">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="font-semibold text-lg">Security Preferences</h3>
          </div>
          <button className="px-6 py-2 bg-sentriGreen text-black font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
            Manage
          </button>
        </div>
      </div>
    </div>
  )
}
