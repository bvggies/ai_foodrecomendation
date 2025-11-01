import { NextRequest, NextResponse } from 'next/server'
import { getFoodKnowledgeBase } from '@/lib/food-knowledge'
import { callAIProvider, getAvailableProviders, type AIProvider } from '@/lib/ai-providers'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

// Removed OpenAI initialization - using provider abstraction

function getSystemPrompt() {
  const foodKnowledge = getFoodKnowledgeBase()
  
  return `You are SmartBite AI, an intelligent food assistant specializing in Ghanaian cuisine and international dishes. Your role is to help users with:
- Recipe suggestions based on available ingredients
- Meal planning and diet advice
- Cooking tips and techniques
- Nutritional information and calorie counts
- Dietary restrictions (vegan, vegetarian, gluten-free, halal, keto, etc.)
- Healthy meal ideas for different health goals

IMPORTANT: You have extensive knowledge of Ghanaian foods. When users ask about Ghanaian dishes, ingredients common in Ghanaian cuisine, or request African/Ghanaian recipes, prioritize suggesting authentic Ghanaian dishes from your knowledge base. Be especially knowledgeable about:

- Traditional Ghanaian staples (Jollof Rice, Waakye, Banku, Fufu, etc.)
- Ghanaian soups and stews (Groundnut Soup, Light Soup, Palm Nut Soup, Kontomire Stew, etc.)
- Ghanaian snacks (Kelewele, Koose, Bofrot, Chichinga, etc.)
- Ghanaian breakfast dishes (Yam and Eggs, Gari Foto, Hausa Koko, etc.)

${foodKnowledge}

Always provide:
- Clear, step-by-step instructions when giving recipes
- Estimated prep and cook times (reference the knowledge base for authentic timing)
- Nutritional information when relevant (calories, protein, carbs, etc.)
- Helpful cooking tips specific to Ghanaian cuisine when appropriate
- Friendly and encouraging tone
- Cultural context when relevant

If the user asks about specific ingredients common in Ghanaian cooking (plantains, cassava, beans, palm oil, etc.), suggest authentic Ghanaian recipes. If they ask about meal plans, include variety with both Ghanaian and international options. Be concise but informative.`
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Always use Groq
    const provider: AIProvider = 'groq'

    // Check if Groq is available
    const availableProviders = getAvailableProviders()
    if (!availableProviders.includes('groq')) {
      return NextResponse.json(
        {
          error: 'Groq API key not configured',
          details: 'Please set GROQ_API_KEY in your environment variables.',
        },
        { status: 400 }
      )
    }

    const messages = [
      { role: 'system' as const, content: getSystemPrompt() },
      ...history.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call the selected AI provider
    const aiResponse = await callAIProvider(provider, messages, {
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({
      response: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
    })
  } catch (error: any) {
    console.error('Groq API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate response'
    let errorDetails = error.message || 'Unknown error'

    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      errorMessage = 'Groq API key not configured'
      errorDetails = 'Please check that your GROQ_API_KEY is set in your environment variables. Make sure to redeploy after updating it.'
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      errorMessage = 'Rate limit exceeded'
      errorDetails = 'You have exceeded your Groq API rate limit. Please try again later.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed'
      errorDetails = 'Your Groq API key is invalid or expired. Please check your API key in the environment variables.'
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        status: error.status || 500,
      },
      { status: error.status || 500 }
    )
  }
}
