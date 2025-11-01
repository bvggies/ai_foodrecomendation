/**
 * AI Provider abstraction layer
 * Supports multiple AI providers: OpenAI, Gemini, Claude
 */

export type AIProvider = 'openai' | 'gemini' | 'claude'

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
 * OpenAI Provider
 */
export async function callOpenAI(
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const { OpenAI } = await import('openai')
  
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured')
  }

  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  const openai = new OpenAI({ apiKey })

  const completion = await openai.chat.completions.create({
    model: model,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
  })

  return {
    content: completion.choices[0]?.message?.content || 'No response generated',
    model: model,
    provider: 'openai',
  }
}

/**
 * Google Gemini Provider (Free tier available)
 */
export async function callGemini(
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured')
  }

  // Convert messages to Gemini format
  // Gemini uses different message format, need to convert
  const geminiMessages = messages
    .filter(msg => msg.role !== 'system') // System messages handled differently
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

  // Add system instruction if present
  const systemMessage = messages.find(msg => msg.role === 'system')
  const systemInstruction = systemMessage?.content

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: geminiMessages,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1000,
      },
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

  return {
    content,
    model: model,
    provider: 'gemini',
  }
}

/**
 * Anthropic Claude Provider
 */
export async function callClaude(
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_claude_api_key_here') {
    throw new Error('Claude API key not configured')
  }

  const model = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307'
  
  // Extract system message and convert to Claude format
  const systemMessage = messages.find(msg => msg.role === 'system')?.content
  const conversationMessages = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      system: systemMessage,
      messages: conversationMessages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text || 'No response generated'

  return {
    content,
    model: model,
    provider: 'claude',
  }
}

/**
 * Main function to call AI provider based on selection
 */
export async function callAIProvider(
  provider: AIProvider,
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  switch (provider) {
    case 'openai':
      return callOpenAI(messages, options)
    case 'gemini':
      return callGemini(messages, options)
    case 'claude':
      return callClaude(messages, options)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

/**
 * Get available providers based on configured API keys
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = []
  
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey && openaiKey.trim() !== '' && openaiKey !== 'your_openai_api_key_here') {
    providers.push('openai')
  }
  
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
    providers.push('gemini')
  }
  
  const claudeKey = process.env.CLAUDE_API_KEY
  if (claudeKey && claudeKey.trim() !== '' && claudeKey !== 'your_claude_api_key_here') {
    providers.push('claude')
  }
  
  // Default to OpenAI if none configured
  if (providers.length === 0) {
    providers.push('openai')
  }
  
  return providers
}
