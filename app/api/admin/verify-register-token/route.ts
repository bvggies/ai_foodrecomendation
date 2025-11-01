import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify admin registration token
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' })
    }

    // Get the secret from environment variable
    const adminRegisterToken = process.env.ADMIN_REGISTER_TOKEN || process.env.SEED_SECRET

    if (!adminRegisterToken) {
      return NextResponse.json({
        valid: false,
        error: 'Admin registration is not configured. Set ADMIN_REGISTER_TOKEN environment variable.',
      })
    }

    // Verify token matches
    const isValid = token === adminRegisterToken

    return NextResponse.json({
      valid: isValid,
      error: isValid ? undefined : 'Invalid registration token',
    })
  } catch (error: any) {
    console.error('Error verifying token:', error)
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'Failed to verify token',
      },
      { status: 500 }
    )
  }
}
