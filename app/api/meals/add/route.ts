import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Add a single meal - doesn't delete existing meals
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meal } = await req.json()

    if (!meal || !meal.id || !meal.name || !meal.date) {
      return NextResponse.json({ error: 'Invalid meal data' }, { status: 400 })
    }

    const db = await getDb()

    // Insert or update the meal
    await db.query(
      `INSERT INTO meals (id, date, name, type, time, completed, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
       date = EXCLUDED.date,
       name = EXCLUDED.name,
       type = EXCLUDED.type,
       time = EXCLUDED.time,
       completed = COALESCE(EXCLUDED.completed, meals.completed)`,
      [
        meal.id,
        meal.date,
        meal.name,
        meal.type,
        meal.time || null,
        meal.completed || false,
        userId
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error adding meal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

