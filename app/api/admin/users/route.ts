import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const db = await getDb()

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as count FROM users')
    const total = parseInt(countResult.rows[0].count)

    // Get users
    const result = await db.query(
      `SELECT id, email, name, role, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return NextResponse.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const { name, email, role, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Check if email already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role || 'user']
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()

    const { userId, name, email, role, password } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (name) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }

    if (email) {
      updates.push(`email = $${paramCount++}`)
      values.push(email)
    }

    if (role && ['user', 'admin'].includes(role)) {
      updates.push(`role = $${paramCount++}`)
      values.push(role)
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      const passwordHash = await bcrypt.hash(password, 10)
      updates.push(`password_hash = $${paramCount++}`)
      values.push(passwordHash)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()

    // Check if trying to delete own account
    const session = await getServerSession(authOptions)
    if (session?.user?.id && session.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await db.query('DELETE FROM users WHERE id = $1', [userId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
