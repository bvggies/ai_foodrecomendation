import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { findFoodByName, findFoodsByIngredients, getFoodKnowledgeBase } from '@/lib/food-knowledge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { ingredients, dietType, cuisine } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
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

    // Use configured model or fallback to gpt-3.5-turbo
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef and recipe generator. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content || ''
    
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
      return NextResponse.json(
        { error: 'Failed to parse recipe response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recipe })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate recipe' },
      { status: 500 }
    )
  }
}
