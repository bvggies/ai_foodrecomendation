import { NextResponse } from 'next/server'
import { getAvailableProviders } from '@/lib/ai-providers'

/**
 * Get available AI providers based on configured API keys
 */
export async function GET() {
  try {
    const providers = getAvailableProviders()
    
    const providerInfo = {
      openai: {
        name: 'ChatGPT',
        available: providers.includes('openai'),
        free: false,
        description: 'Classic AI companion',
      },
      gemini: {
        name: 'Gemini Spark',
        available: providers.includes('gemini'),
        free: true,
        description: 'Lightning fast & free',
      },
      claude: {
        name: 'Claude Wisdom',
        available: providers.includes('claude'),
        free: false,
        description: 'Thoughtful & precise',
      },
      groq: {
        name: 'Groq Turbo',
        available: providers.includes('groq'),
        free: true,
        description: 'Ultra-fast & free',
      },
    }

    // Prefer Gemini as default if available, otherwise use first available
    const defaultProvider = providers.includes('gemini') ? 'gemini' : (providers[0] || 'openai')
    
    return NextResponse.json({
      providers: providerInfo,
      available: providers,
      default: defaultProvider,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get providers' },
      { status: 500 }
    )
  }
}
