import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getFoodKnowledgeBase } from '@/lib/food-knowledge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
