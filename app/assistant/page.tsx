'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChefHat, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center gap-2 md:gap-3">
            <ChefHat className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold">SmartBite AI</h1>
              <p className="text-orange-100 text-xs md:text-sm">Powered by Groq Turbo • Ultra-fast & free</p>
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
        <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex gap-2 md:gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about recipes, meal plans, or cooking tips..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 text-white px-4 md:px-6 py-3 rounded-lg active:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 touch-manipulation min-w-[44px] min-h-[44px] justify-center"
              title="Send message"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 hidden sm:block">
            Try: "What can I cook with eggs, tomatoes, and onions?" or "Suggest a healthy dinner under 500 calories"
          </div>
        </form>
      </div>
    </div>
  )
}