import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Production-safe seed endpoint
 * Requires a secret key in the query parameter or request body
 * Usage: POST /api/admin/seed-production?secret=YOUR_SECRET_KEY
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret') || (await req.json()).secret
    
    // Get secret from environment variable
    const requiredSecret = process.env.SEED_SECRET || process.env.VERCEL_ENV === 'development' ? 'dev-secret' : null

    if (!requiredSecret || secret !== requiredSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid or missing secret. Set SEED_SECRET environment variable in Vercel.',
        },
        { status: 403 }
      )
    }

    const db = await getDb()

    const users = [
      // Admin users
      {
        email: 'admin@smartbite.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'superadmin@smartbite.com',
        password: 'SuperAdmin@123',
        name: 'Super Admin',
        role: 'admin',
      },
      // Sample users
      {
        email: 'john@example.com',
        password: 'User@123',
        name: 'John Doe',
        role: 'user',
      },
      {
        email: 'jane@example.com',
        password: 'User@123',
        name: 'Jane Smith',
        role: 'user',
      },
      {
        email: 'chef@example.com',
        password: 'Chef@123',
        name: 'Chef Master',
        role: 'user',
      },
      {
        email: 'foodie@example.com',
        password: 'Foodie@123',
        name: 'Food Lover',
        role: 'user',
      },
    ]

    const results = []

    for (const user of users) {
      try {
        const passwordHash = await bcrypt.hash(user.password, 10)

        // Check if user exists
        const existingUser = await db.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        )

        if (existingUser.rows.length > 0) {
          // Update existing user
          await db.query(
            `UPDATE users 
             SET password_hash = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE email = $4`,
            [passwordHash, user.name, user.role, user.email]
          )
          results.push({ email: user.email, action: 'updated', role: user.role })
        } else {
          // Create new user
          await db.query(
            `INSERT INTO users (email, password_hash, name, role) 
             VALUES ($1, $2, $3, $4)`,
            [user.email, passwordHash, user.name, user.role]
          )
          results.push({ email: user.email, action: 'created', role: user.role })
        }
      } catch (err: any) {
        results.push({ email: user.email, action: 'error', error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Users seeded successfully',
      timestamp: new Date().toISOString(),
      results,
      credentials: {
        admin: {
          email: 'admin@smartbite.com',
          password: 'Admin@123',
        },
        superadmin: {
          email: 'superadmin@smartbite.com',
          password: 'SuperAdmin@123',
        },
      },
    })
  } catch (error: any) {
    console.error('Error seeding users:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to seed users',
        hint: 'Make sure DATABASE_URL is set and the database is accessible',
      },
      { status: 500 }
    )
  }
}

// Also support GET for easy browser access
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (!secret) {
    return NextResponse.json(
      { 
        error: 'Missing secret',
        message: 'Add ?secret=YOUR_SECRET_KEY to the URL',
        instructions: 'Set SEED_SECRET environment variable in Vercel dashboard',
      },
      { status: 400 }
    )
  }

  // Reuse POST handler logic
  const mockReq = {
    json: async () => ({ secret }),
    url: req.url,
  } as NextRequest

  return POST(mockReq)
}
