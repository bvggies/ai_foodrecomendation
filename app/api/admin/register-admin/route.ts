import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Register a new admin user (requires valid token)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, token } = await req.json()

    if (!email || !password || !name || !token) {
      return NextResponse.json(
        { error: 'Email, password, name, and token are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Verify token
    const adminRegisterToken = process.env.ADMIN_REGISTER_TOKEN || process.env.SEED_SECRET

    if (!adminRegisterToken || token !== adminRegisterToken) {
      return NextResponse.json(
        { error: 'Invalid registration token' },
        { status: 403 }
      )
    }

    const db = await getDb()

    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      // Update existing user to admin
      const passwordHash = await bcrypt.hash(password, 10)
      await db.query(
        'UPDATE users SET password_hash = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4',
        [passwordHash, name, 'admin', email]
      )

      return NextResponse.json({
        success: true,
        message: 'Existing user upgraded to admin',
        user: {
          email,
          name,
          role: 'admin',
        },
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin user
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, 'admin']
    )

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register admin user' },
      { status: 500 }
    )
  }
}
