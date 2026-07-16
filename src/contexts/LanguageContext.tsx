'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'English (US)' | 'Spanish' | 'French' | 'Japanese'

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'English (US)': {
    dashboard: 'Dashboard',
    analyze: 'Analyze',
    research: 'Research',
    chat: 'AI Chat',
    settings: 'Settings',
    connectWallet: 'Connect',
    disconnect: 'Disconnect',
    walletConnected: 'Connected',
    walletNotConnected: 'Not Connected',
    language: 'Language',
    notifications: 'Notifications',
    securityPreferences: 'Security Preferences',
    manage: 'Manage',
    walletConnection: 'Wallet Connection',
    transactionAnalyzer: 'Transaction Analyzer',
    askSentri: 'Ask Sentri anything about crypto security...',
    searchPlaceholder: 'Paste a transaction hash or wallet address...',
    riskScore: 'Risk Score',
  },
  'Spanish': {
    dashboard: 'Panel',
    analyze: 'Analizar',
    research: 'Investigación',
    chat: 'Chat IA',
    settings: 'Ajustes',
    connectWallet: 'Conectar',
    disconnect: 'Desconectar',
    walletConnected: 'Conectado',
    walletNotConnected: 'No conectado',
    language: 'Idioma',
    notifications: 'Notificaciones',
    securityPreferences: 'Preferencias de Seguridad',
    manage: 'Gestionar',
    walletConnection: 'Conexión de Billetera',
    transactionAnalyzer: 'Analizador de Transacciones',
    askSentri: 'Pregúntale a Sentri sobre seguridad criptográfica...',
    searchPlaceholder: 'Pega un hash de transacción o dirección...',
    riskScore: 'Puntuación de Riesgo',
  },
  'French': {
    dashboard: 'Tableau de bord',
    analyze: 'Analyser',
    research: 'Recherche',
    chat: 'Chat IA',
    settings: 'Paramètres',
    connectWallet: 'Connecter',
    disconnect: 'Déconnecter',
    walletConnected: 'Connecté',
    walletNotConnected: 'Non connecté',
    language: 'Langue',
    notifications: 'Notifications',
    securityPreferences: 'Préférences de sécurité',
    manage: 'Gérer',
    walletConnection: 'Connexion du portefeuille',
    transactionAnalyzer: 'Analyseur de transactions',
    askSentri: 'Posez des questions à Sentri sur la sécurité crypto...',
    searchPlaceholder: 'Collez un hachage de transaction ou une adresse...',
    riskScore: 'Score de risque',
  },
  'Japanese': {
    dashboard: 'ダッシュボード',
    analyze: '分析',
    research: 'リサーチ',
    chat: 'AIチャット',
    settings: '設定',
    connectWallet: '接続',
    disconnect: '切断',
    walletConnected: '接続済み',
    walletNotConnected: '未接続',
    language: '言語',
    notifications: '通知',
    securityPreferences: 'セキュリティ設定',
    manage: '管理',
    walletConnection: 'ウォレット接続',
    transactionAnalyzer: 'トランザクションアナライザー',
    askSentri: '暗号セキュリティについてSentriに質問する...',
    searchPlaceholder: 'トランザクションハッシュまたはアドレスを貼り付け...',
    riskScore: 'リスクスコア',
  }
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'English (US)',
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('English (US)')

  useEffect(() => {
    const saved = localStorage.getItem('sentri_language') as Language
    if (saved && translations[saved]) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('sentri_language', lang)
  }

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
