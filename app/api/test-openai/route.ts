import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * Test endpoint to verify OpenAI API key is configured correctly
 */
export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({
        configured: false,
        error: 'OPENAI_API_KEY is not set or is empty',
        details: {
          exists: !!apiKey,
          length: apiKey?.length || 0,
          isPlaceholder: apiKey === 'your_openai_api_key_here',
        },
        instructions: 'Set OPENAI_API_KEY in your environment variables and redeploy.',
      })
    }

    // Try to create a minimal test request
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Test with a simple completion
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test" if you can read this.' }],
      max_tokens: 10,
    })

    return NextResponse.json({
      configured: true,
      valid: true,
      message: 'OpenAI API key is configured and working!',
      testResponse: testCompletion.choices[0]?.message?.content || 'No response',
      keyInfo: {
        length: apiKey.length,
        startsWith: apiKey.substring(0, 7),
        endsWith: '...' + apiKey.substring(apiKey.length - 4),
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      valid: false,
      error: error.message || 'Failed to connect to OpenAI',
      status: error.status || 500,
      details: error.response?.data || null,
      message: error.message?.includes('API key')
        ? 'Your OpenAI API key appears to be invalid. Please check that it starts with "sk-" and is correct.'
        : 'There was an error connecting to OpenAI. Please check your API key and try again.',
    }, { status: 500 })
  }
}
