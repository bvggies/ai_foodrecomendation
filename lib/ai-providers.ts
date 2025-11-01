/**
 * AI Provider - Groq only
 * Using Groq for ultra-fast AI inference with free tier
 */

export type AIProvider = 'groq'

export interface AIResponse {
  content: string
  model: string
  provider: AIProvider
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Groq Provider (FREE tier - Very fast inference)
 */
export async function callGroq(
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY in your environment variables.')
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || 'No response generated'

  return {
    content,
    model: model,
    provider: 'groq',
  }
}

/**
 * Main function to call AI provider (always Groq)
 */
export async function callAIProvider(
  provider: AIProvider,
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  if (provider !== 'groq') {
    throw new Error(`Only Groq is supported. Received: ${provider}`)
  }
  return callGroq(messages, options)
}

/**
 * Get available providers (always returns Groq if configured)
 */
export function getAvailableProviders(): AIProvider[] {
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey && groqKey.trim() !== '' && groqKey !== 'your_groq_api_key_here') {
    return ['groq']
  }
  return []
}