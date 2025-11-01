/**
 * AI Provider abstraction layer
 * Supports multiple AI providers: OpenAI, Gemini, Claude, Groq
 */

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'groq'

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
  // For Gemini API v1, system instructions need to be included in the first user message
  // (systemInstruction field is not supported in v1 API)
  const systemMessage = messages.find(msg => msg.role === 'system')
  const systemInstruction = systemMessage?.content

  // Convert messages to Gemini format (filter out system message)
  const geminiMessages = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

  // If there's a system instruction, prepend it to the first user message
  if (systemInstruction && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
    geminiMessages[0].parts[0].text = `${systemInstruction}\n\n${geminiMessages[0].parts[0].text}`
  }

  const model = process.env.GEMINI_MODEL || 'gemini-pro'
  
  // Use v1 API instead of v1beta for better compatibility
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
  
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
 * Groq Provider (FREE tier - Very fast inference)
 */
export async function callGroq(
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured')
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
    case 'groq':
      return callGroq(messages, options)
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
  
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey && groqKey.trim() !== '' && groqKey !== 'your_groq_api_key_here') {
    providers.push('groq')
  }
  
  // Default to Gemini if none configured (since it's free), otherwise OpenAI
  if (providers.length === 0) {
    providers.push('gemini')
    providers.push('openai')
  }
  
  return providers
}
