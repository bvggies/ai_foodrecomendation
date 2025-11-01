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
        name: 'OpenAI (GPT-3.5/GPT-4)',
        available: providers.includes('openai'),
        free: false,
        description: 'Powerful and widely available AI',
      },
      gemini: {
        name: 'Google Gemini',
        available: providers.includes('gemini'),
        free: true,
        description: 'Free tier available, fast responses',
      },
      claude: {
        name: 'Anthropic Claude',
        available: providers.includes('claude'),
        free: false,
        description: 'High-quality AI assistant',
      },
    }

    return NextResponse.json({
      providers: providerInfo,
      available: providers,
      default: providers[0] || 'openai',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get providers' },
      { status: 500 }
    )
  }
}
