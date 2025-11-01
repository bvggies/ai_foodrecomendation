import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Get all meals for a user (past, present, and future)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    if (!userId) {
      return NextResponse.json({ meals: [] })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const completed = searchParams.get('completed') // 'true', 'false', or null for all

    const db = await getDb()

    let query = 'SELECT * FROM meals WHERE user_id = $1'
    const params: any[] = [userId]
    let paramCount = 1

    if (completed !== null && completed !== undefined) {
      query += ` AND completed = $${++paramCount}`
      params.push(completed === 'true')
    }

    query += ' ORDER BY date DESC, time ASC LIMIT $' + (++paramCount)
    params.push(limit)

    const result = await db.query(query, params)
    return NextResponse.json({ meals: result.rows })
  } catch (error: any) {
    console.error('Error fetching all meals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

