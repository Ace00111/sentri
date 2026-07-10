'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi, I'm Sentri. Paste a wallet address or transaction hash and I'll flag any risk before you sign."
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!res.ok) throw new Error('Chat request failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        let fullText = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText }
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your GROQ_API_KEY in .env.local and try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-darkBg relative -m-8">
      {/* BEGIN: Chat Header */}
      <header className="px-8 py-6 border-b border-zinc-900 flex items-center gap-4" data-purpose="chat-header">
        <div className="w-12 h-12 bg-sentriGreen rounded-xl flex items-center justify-center">
          {/* Robot Icon */}
          <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <rect height="10" rx="2" width="18" x="3" y="11"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" x2="8" y1="16" y2="16"></line>
            <line x1="16" x2="16" y1="16" y2="16"></line>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">Sentri AI</h1>
          <p className="text-sm text-mutedText">Your crypto security assistant</p>
        </div>
      </header>
      {/* END: Chat Header */}

      {/* BEGIN: Chat History Window */}
      <section className="flex-1 overflow-y-auto p-8 scrollbar-hide" data-purpose="chat-history">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${
                message.role === 'user' 
                  ? 'bg-sentriGreen text-black rounded-tr-none' 
                  : 'bg-[#1A1A1A] border border-zinc-800/50 rounded-tl-none text-white'
                } px-6 py-4 rounded-2xl max-w-2xl font-medium`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-[#1A1A1A] border border-zinc-800/50 px-6 py-4 rounded-2xl rounded-tl-none max-w-2xl">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>
      {/* END: Chat History Window */}

      {/* BEGIN: Chat Input Area */}
      <footer className="p-8 pt-0" data-purpose="chat-input-container">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <input 
            name="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            className="w-full bg-[#1A1A1A] border border-zinc-800 text-white rounded-2xl py-5 pl-6 pr-16 focus:outline-none focus:ring-1 focus:ring-sentriGreen/50 focus:border-sentriGreen/50 placeholder:text-zinc-600 transition-all" 
            placeholder="Ask Sentri anything about crypto security..." 
            type="text"
            autoComplete="off"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send Message" 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-sentriGreen text-black p-3 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all shadow-lg disabled:opacity-50" 
            data-purpose="send-button"
          >
            <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
          </button>
        </form>
      </footer>
      {/* END: Chat Input Area */}
    </div>
  )
}
