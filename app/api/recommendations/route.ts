import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getGhanaianFoods, getFoodKnowledgeBase } from '@/lib/food-knowledge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { dietType, healthGoal, cuisine, maxCalories } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
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

    // Use configured model or fallback to gpt-3.5-turbo
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional nutritionist and chef. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content || ''
    
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
