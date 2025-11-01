import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGhanaianFoods, getFoodKnowledgeBase } from '@/lib/food-knowledge'
import { callAIProvider, getAvailableProviders, type AIProvider } from '@/lib/ai-providers'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { dietType, healthGoal, cuisine, maxCalories, provider: requestedProvider } = await req.json()

    // Get user's preferred AI provider (if logged in)
    let selectedProvider: AIProvider = 'openai'
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

    const foodKnowledge = getFoodKnowledgeBase()
    const ghanaianFoods = getGhanaianFoods()
    
    let prompt = 'Generate 6 personalized recipe recommendations based on the following preferences:\n\n'

    if (dietType) {
      prompt += `- Diet Type: ${dietType}\n`
    }
    if (healthGoal) {
      prompt += `- Health Goal: ${healthGoal}\n`
    }
    if (cuisine) {
      prompt += `- Preferred Cuisine: ${cuisine}\n`
    }
    if (maxCalories) {
      prompt += `- Maximum Calories: ${maxCalories}\n`
    }
    
    // Include Ghanaian food knowledge if cuisine is Ghanaian or not specified
    if (cuisine?.toLowerCase().includes('ghana') || !cuisine || cuisine === '') {
      prompt += `\n\nYou have extensive knowledge of Ghanaian cuisine. Include at least 2-3 authentic Ghanaian dishes in your recommendations:\n${foodKnowledge}\n\n`
      prompt += `Prioritize authentic Ghanaian recipes when they match the user's preferences.`
    }

    prompt += `\nFor each recipe, provide:
- A creative and appealing name
- A brief description (1-2 sentences)
- Estimated prep time in minutes
- Estimated cook time in minutes
- Calories per serving
- A relevant food emoji
- Diet type (if applicable)
- Cuisine type (if applicable)

Make sure the recipes are diverse, practical, and match the preferences. Respond with a JSON array in this format:
[
  {
    "name": "Recipe name",
    "description": "Brief description",
    "prepTime": number,
    "cookTime": number,
    "calories": number,
    "image": "emoji",
    "dietType": "optional",
    "cuisine": "optional"
  },
  ...
]`

    // Call the selected AI provider
    const aiResponse = await callAIProvider(
      provider,
      [
        {
          role: 'system',
          content: 'You are a professional nutritionist and chef. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.8,
        maxTokens: 2000,
      }
    )

    const response = aiResponse.content
    
    let recommendations
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        recommendations = JSON.parse(response)
      }
    } catch (parseError) {
      console.error('Failed to parse recommendations JSON:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse recommendations response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
