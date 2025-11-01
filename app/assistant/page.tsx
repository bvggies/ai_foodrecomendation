'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChefHat, Loader2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  provider?: string
}

type AIProvider = 'openai' | 'gemini' | 'claude'

interface ProviderInfo {
  name: string
  available: boolean
  free: boolean
  description: string
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm SmartBite AI, your personal food assistant. I can help you with:\n\n• Recipe suggestions based on ingredients\n• Meal planning and diet advice\n• Cooking tips and techniques\n• Nutritional information\n• Ghanaian cuisine expertise\n\nWhat would you like to cook today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai')
  const [availableProviders, setAvailableProviders] = useState<Record<string, ProviderInfo>>({})
  const [showProviderSelector, setShowProviderSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load available providers
    fetch('/api/ai-providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setAvailableProviders(data.providers)
          // Set default to first available
          if (data.available && data.available.length > 0) {
            setSelectedProvider(data.available[0] as AIProvider)
          }
        }
      })
      .catch(console.error)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: messages,
          provider: selectedProvider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API error response
        const errorMsg = data.details || data.error || 'An error occurred'
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${errorMsg}`,
          },
        ])
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        provider: data.provider || selectedProvider,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error.message || 'Failed to connect to the server. Please check your connection and try again.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${errorMessage}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">SmartBite AI</h1>
                <p className="text-orange-100 text-sm">AI helping you pick the right bite</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProviderSelector(!showProviderSelector)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden md:inline">
                  {availableProviders[selectedProvider]?.name || 'AI Provider'}
                </span>
                <span className="md:hidden">AI</span>
              </button>
              
              {showProviderSelector && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl p-4 min-w-[280px] z-50 border border-gray-200">
                  <div className="text-gray-800 font-semibold mb-3">Select AI Provider</div>
                  {Object.entries(availableProviders).map(([key, provider]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedProvider(key as AIProvider)
                        setShowProviderSelector(false)
                      }}
                      disabled={!provider.available}
                      className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                        selectedProvider === key
                          ? 'bg-orange-500 text-white'
                          : provider.available
                          ? 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {provider.name}
                        {provider.free && provider.available && (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${selectedProvider === key ? 'text-orange-100' : 'text-gray-500'}`}>
                        {provider.description}
                      </div>
                      {!provider.available && (
                        <div className="text-xs text-red-500 mt-1">Not configured</div>
                      )}
                    </button>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    💡 Configure API keys in environment variables to enable providers
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.provider && message.role === 'assistant' && (
                  <div className="text-xs mt-2 text-gray-500">
                    Powered by {availableProviders[message.provider]?.name || message.provider}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about recipes, meal plans, or cooking tips..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Try: "What can I cook with eggs, tomatoes, and onions?" or "Suggest a healthy dinner under 500 calories"
          </div>
        </form>
      </div>
    </div>
  )
}
