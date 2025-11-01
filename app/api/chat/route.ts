import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const systemPrompt = `You are a helpful AI Food Assistant. Your role is to help users with:
- Recipe suggestions based on available ingredients
- Meal planning and diet advice
- Cooking tips and techniques
- Nutritional information and calorie counts
- Dietary restrictions (vegan, vegetarian, gluten-free, halal, keto, etc.)
- Healthy meal ideas for different health goals

Always provide:
- Clear, step-by-step instructions when giving recipes
- Estimated prep and cook times
- Nutritional information when relevant (calories, protein, carbs, etc.)
- Helpful cooking tips
- Friendly and encouraging tone

If the user asks about specific ingredients, suggest creative recipes. If they ask about meal plans, provide detailed weekly plans with variety. Be concise but informative.`

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
      { role: 'system' as const, content: systemPrompt },
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
