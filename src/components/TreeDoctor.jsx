import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2, Stethoscope, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

export default function TreeDoctor({ chatContext, setChatContext }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am Tree Doctor, your AI urban canopy health assistant. Describe any symptoms you notice on a tree (like leaf discoloration, trunk damage, or pest signs), and I will help you assess its condition!'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTreeContext, setActiveTreeContext] = useState(null)

  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // Listen to incoming map contexts (clicks from details drawer)
  useEffect(() => {
    if (chatContext) {
      setIsOpen(true)
      const speciesCommon = chatContext.species.split(' (')[0]
      const statusText = chatContext.status.replace('_', ' ')
      
      const greeting = `I see you are asking about the ${speciesCommon} (current status: ${statusText}). Please describe any specific symptoms you observe (e.g. browning leaves, bark peeling, pest damage) so I can help diagnose it.`
      
      setActiveTreeContext({
        species: chatContext.species,
        status: chatContext.status
      })

      // Add context greeting to thread
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: greeting }
      ])

      // Clear the trigger parent state
      setChatContext(null)
    }
  }, [chatContext, setChatContext])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    const userMsg = { role: 'user', content: inputText.trim() }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setLoading(true)

    // Gather last 8 messages for context history
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg.content,
          context: activeTreeContext,
          history
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Server error')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error('Chat API Error:', err)
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: err.message?.includes('configured') 
            ? 'Tree Doctor is offline because the GROQ_API_KEY environment variable is not configured yet. Please configure it in your environment settings.'
            : 'Tree Doctor is a bit busy — try again in a moment.',
          isError: true 
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am Tree Doctor, your AI urban canopy health assistant. Describe any symptoms you notice on a tree (like leaf discoloration, trunk damage, or pest signs), and I will help you assess its condition!'
      }
    ])
    setActiveTreeContext(null)
    setConfirmError('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* 1. CHAT TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-forest hover:bg-forest-hover text-offwhite flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10 group relative"
          title="Ask Tree Doctor AI"
        >
          <Stethoscope className="h-6 w-6 text-terracotta transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 bg-terracotta text-offwhite text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce border border-white">
            AI
          </span>
        </button>
      )}

      {/* 2. CHAT PANEL SCREEN */}
      {isOpen && (
        <div className="bg-white border border-offwhite-dark rounded-3xl shadow-2xl flex flex-col w-[92vw] sm:w-[360px] h-[480px] overflow-hidden transition-all duration-300 animate-slide-in">
          
          {/* Header */}
          <div className="bg-forest text-offwhite px-4 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-xl border border-white/10">
                <Stethoscope className="h-5 w-5 text-terracotta" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-sm tracking-wide">Tree Doctor AI</h4>
                <span className="block text-[8px] text-offwhite/60 tracking-wider uppercase font-semibold">
                  Urban Canopy Health Assistant
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Reset Thread */}
              <button
                onClick={handleReset}
                className="text-offwhite/60 hover:text-offwhite p-1 transition-colors"
                title="Restart Chat"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-offwhite/60 hover:text-offwhite p-1 transition-colors"
                title="Minimize Chat"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Active context card */}
          {activeTreeContext && (
            <div className="bg-forest-light/10 border-b border-offwhite-dark px-4 py-2 flex items-center justify-between text-[10px] shrink-0 text-forest">
              <span className="font-medium truncate max-w-[200px]">
                Target: <strong>{activeTreeContext.species.split(' (')[0]}</strong>
              </span>
              <span className="text-[8px] bg-forest/10 border border-forest/10 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">
                {activeTreeContext.status.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-offwhite-light/40 flex flex-col">
            {messages.map((msg, idx) => {
              const isBot = msg.role === 'assistant'
              return (
                <div
                  key={idx}
                  className={`flex flex-col text-xs leading-relaxed max-w-[80%] ${
                    isBot ? 'self-start' : 'self-end'
                  }`}
                >
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl ${
                      isBot 
                        ? msg.isError 
                          ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-none font-semibold'
                          : 'bg-white border border-offwhite-dark text-charcoal rounded-tl-none shadow-sm' 
                        : 'bg-forest text-offwhite rounded-tr-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[8px] text-charcoal/30 mt-1 block px-1 ${
                    isBot ? 'text-left' : 'text-right'
                  }`}>
                    {isBot ? 'Tree Doctor' : 'You'}
                  </span>
                </div>
              )
            })}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="self-start flex flex-col text-xs leading-relaxed max-w-[80%]">
                <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-offwhite-dark text-charcoal/60 rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 text-terracotta animate-spin" />
                  <span>Tree Doctor is diagnosing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="shrink-0 bg-white border-t border-offwhite-dark">
            <form onSubmit={handleSend} className="p-3 flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about spots on leaves, bark bugs..."
                className="flex-1 bg-offwhite border border-offwhite-dark rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest text-charcoal placeholder-charcoal/40"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="h-8 w-8 bg-forest hover:bg-forest-hover disabled:opacity-40 text-offwhite flex items-center justify-center rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-terracotta" />
              </button>
            </form>
            
            {/* Disclaimer */}
            <span className="block text-[8px] text-charcoal/30 text-center select-none pb-2">
              ⚠️ Tree Doctor gives general guidance, not a certified diagnosis.
            </span>
          </div>

        </div>
      )}

    </div>
  )
}
