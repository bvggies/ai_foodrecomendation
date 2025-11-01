import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Test endpoint to check if a specific user exists and verify password
 * Useful for debugging login issues
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        message: 'User not found in database',
        suggestion: 'Run /api/admin/seed-production to create accounts',
      })
    }

    const user = result.rows[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      passwordValid: isValid,
      message: isValid
        ? 'Password is correct. User should be able to login.'
        : 'Password is incorrect. Make sure you are using the correct password.',
      troubleshooting: {
        canLogin: isValid && user.id,
        roleIsAdmin: user.role === 'admin',
        hasPasswordHash: !!user.password_hash,
      },
    })
  } catch (error: any) {
    console.error('Error testing login:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to test login',
        hint: 'Check database connection and user table structure',
      },
      { status: 500 }
    )
  }
}
