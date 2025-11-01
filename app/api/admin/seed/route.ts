import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    // Allow seeding in development without secret, require secret in production
    const body = await req.json().catch(() => ({}))
    const secret = body.secret || (new URL(req.url)).searchParams.get('secret')
    const isDevelopment = process.env.NODE_ENV === 'development'
    const validSecret = process.env.SEED_SECRET

    // In production, require secret; in development, allow without secret
    if (!isDevelopment) {
      if (!validSecret || secret !== validSecret) {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'In production, you must provide a valid secret. Set SEED_SECRET in Vercel environment variables and use /api/admin/seed-production endpoint.',
            hint: 'Use /api/admin/seed-production?secret=YOUR_SECRET for production seeding',
          },
          { status: 403 }
        )
      }
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
    }

    return NextResponse.json({
      success: true,
      message: 'Users seeded successfully',
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
      { error: error.message || 'Failed to seed users' },
      { status: 500 }
    )
  }
}
