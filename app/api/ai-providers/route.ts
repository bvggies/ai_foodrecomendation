import { NextResponse } from 'next/server'
import { getAvailableProviders } from '@/lib/ai-providers'

/**
 * Get available AI providers (Groq only)
 */
export async function GET() {
  try {
    const providers = getAvailableProviders()
    
    const providerInfo = {
      groq: {
        name: 'Groq Turbo',
        available: providers.includes('groq'),
        free: true,
        description: 'Ultra-fast & free',
      },
    }

    return NextResponse.json({
      providers: providerInfo,
      available: providers,
      default: 'groq',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get providers' },
      { status: 500 }
    )
  }
}