import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findFoodByName, findFoodsByIngredients, getFoodKnowledgeBase } from '@/lib/food-knowledge'
import { callAIProvider, getAvailableProviders, type AIProvider } from '@/lib/ai-providers'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { ingredients, dietType, cuisine, provider: requestedProvider } = await req.json()

    // Get user's preferred AI provider (if logged in), default to Groq
    let selectedProvider: AIProvider = 'groq'
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const db = await getDb()
        const prefsResult = await db.query(
          'SELECT ai_provider FROM user_preferences WHERE user_id = $1',
          [session.user.id]
        )
        if (prefsResult.rows.length > 0 && prefsResult.rows[0].ai_provider) {
          selectedProvider = prefsResult.rows[0].ai_provider as AIProvider
        }
      }
    } catch (e) {
      // If we can't get user preferences, use default
    }

    // Use requested provider if provided, otherwise use user preference
    const provider: AIProvider = requestedProvider || selectedProvider

    // Check available providers
    const availableProviders = getAvailableProviders()
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        {
          error: `AI provider "${provider}" is not available`,
          details: `Available providers: ${availableProviders.join(', ')}. Please configure the required API keys.`,
          availableProviders,
        },
        { status: 400 }
      )
    }

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      )
    }

    const ingredientsList = ingredients.join(', ')
    
    // Check if ingredients match any Ghanaian foods
    const matchingGhanaianFoods = findFoodsByIngredients(ingredients)
    const foodKnowledge = getFoodKnowledgeBase()
    
    let prompt = `Generate a detailed recipe using the following ingredients: ${ingredientsList}.`

    // If cuisine is Ghanaian or ingredients match Ghanaian foods, include knowledge
    if (cuisine === 'Ghanaian' || cuisine?.toLowerCase().includes('ghana') || matchingGhanaianFoods.length > 0) {
      prompt += `\n\nIMPORTANT: The user wants a ${cuisine || 'Ghanaian'} recipe. You have extensive knowledge of Ghanaian cuisine.`
      if (matchingGhanaianFoods.length > 0) {
        prompt += `\n\nThese ingredients are commonly used in these Ghanaian dishes: ${matchingGhanaianFoods.map(f => f.name).join(', ')}.`
        prompt += `\n\nReference your Ghanaian food knowledge base:\n${foodKnowledge}`
        prompt += `\n\nIf possible, suggest an authentic Ghanaian dish that matches the ingredients provided.`
      }
      prompt += `\n\nEnsure the recipe is authentic to Ghanaian cooking methods and flavors.`
    }

    if (dietType) {
      prompt += ` The recipe must be ${dietType}.`
    }

    if (cuisine && !cuisine.toLowerCase().includes('ghana')) {
      prompt += ` The recipe should be ${cuisine} cuisine.`
    }

    prompt += `\n\nPlease provide the recipe in the following JSON format:
{
  "name": "Recipe name",
  "description": "Brief description",
  "prepTime": number in minutes,
  "cookTime": number in minutes,
  "servings": number,
  "calories": number per serving,
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "nutrition": {
    "protein": "Xg",
    "carbs": "Xg",
    "fat": "Xg"
  }
}

Make sure the recipe is creative, practical, and includes all necessary ingredients and detailed step-by-step instructions.`

    // Call the selected AI provider
    const aiResponse = await callAIProvider(
      provider,
      [
        {
          role: 'system',
          content: 'You are a professional chef and recipe generator. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    )

    const response = aiResponse.content
    
    // Try to extract JSON from the response
    let recipe
    try {
      // Remove markdown code blocks if present
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0])
      } else {
        recipe = JSON.parse(response)
      }
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', parseError)
      console.error('Raw AI response:', response)
      return NextResponse.json(
        { 
          error: 'Failed to parse recipe response',
          details: `The AI returned invalid JSON. Please try again or select a different AI provider.`,
          rawResponse: response.substring(0, 500), // Include first 500 chars for debugging
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ recipe })
  } catch (error: any) {
    console.error('Recipe generation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate recipe'
    let errorDetails = error.message || 'Unknown error'

    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      errorMessage = `AI provider not configured`
      errorDetails = error.message
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      errorMessage = 'Rate limit exceeded'
      errorDetails = 'You have exceeded the API rate limit. Please try again later or switch to a different AI provider.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed'
      errorDetails = 'The AI provider API key is invalid or expired. Please check your environment variables.'
    } else if (error.message?.includes('not available')) {
      errorMessage = error.message
      errorDetails = error.details || 'Please configure the required API keys in your environment variables.'
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        provider: error.provider || 'unknown',
      },
      { status: error.status || 500 }
    )
  }
}
