import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getFoodKnowledgeBase } from '@/lib/food-knowledge'

// Initialize OpenAI client (will be recreated with valid key in route handler)
let openai: OpenAI | null = null

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

    // Check if API key exists and is not empty
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
      console.error('OpenAI API Key Check:', {
        exists: !!apiKey,
        length: apiKey?.length || 0,
        startsWith: apiKey?.substring(0, 7) || 'none',
      })
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          details: 'Please set OPENAI_API_KEY in your environment variables. Make sure to redeploy after adding it.',
        },
        { status: 500 }
      )
    }

    // Initialize OpenAI client with validated API key
    openai = new OpenAI({
      apiKey: apiKey,
    })

    const messages = [
      { role: 'system' as const, content: getSystemPrompt() },
      ...history.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Use configured model or fallback to gpt-3.5-turbo (more widely available)
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate response'
    let errorDetails = error.message || 'Unknown error'

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid OpenAI API key'
      errorDetails = 'Please check that your OPENAI_API_KEY is correct and starts with "sk-". Make sure to redeploy after updating it.'
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      errorMessage = 'Rate limit exceeded'
      errorDetails = 'You have exceeded your OpenAI API rate limit. Please try again later.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed'
      errorDetails = 'Your OpenAI API key is invalid or expired. Please check your API key in the environment variables.'
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
