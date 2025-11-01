import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    if (!userId) {
      return NextResponse.json({ meals: [] })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      'SELECT * FROM meals WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date, time',
      [userId, startDate, endDate]
    )
    return NextResponse.json({ meals: result.rows })
  } catch (error: any) {
    console.error('Error fetching meals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meals } = await req.json()
    const db = await getDb()

    // Clear existing meals for the date range
    if (meals.length > 0) {
      const dates = meals.map((m: any) => m.date)
      const minDate = Math.min(...dates)
      const maxDate = Math.max(...dates)
      
      await db.query(
        'DELETE FROM meals WHERE user_id = $1 AND date >= $2 AND date <= $3',
        [userId, minDate, maxDate]
      )
    }

    // Insert new meals
    for (const meal of meals) {
      for (const mealItem of meal.meals || []) {
        await db.query(
          'INSERT INTO meals (id, date, name, type, time, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            mealItem.id,
            meal.date,
            mealItem.name,
            mealItem.type,
            mealItem.time || null,
            userId
          ]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving meals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
