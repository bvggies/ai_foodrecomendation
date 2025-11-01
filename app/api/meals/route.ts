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
    
    // Convert date to string format for consistency
    const meals = result.rows.map((row: any) => ({
      ...row,
      date: typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0],
    }))
    
    return NextResponse.json({ meals })
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

    // Get all dates from the meals array to determine the range
    const dates = meals.map((m: any) => m.date).filter(Boolean)
    
    if (dates.length > 0) {
      // Find min and max dates
      const sortedDates = dates.sort()
      const minDate = sortedDates[0]
      const maxDate = sortedDates[sortedDates.length - 1]
      
      // Clear existing meals for this date range
      await db.query(
        'DELETE FROM meals WHERE user_id = $1 AND date >= $2 AND date <= $3',
        [userId, minDate, maxDate]
      )
    }

    // Insert new meals one by one
    for (const dayMeals of meals) {
      if (!dayMeals.date || !dayMeals.meals || !Array.isArray(dayMeals.meals)) continue
      
      for (const mealItem of dayMeals.meals) {
        if (!mealItem.id || !mealItem.name) continue
        
        try {
          // Delete existing meal with same ID for this user (if any)
          await db.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [mealItem.id, userId])
          
          // Insert the meal
          await db.query(
            `INSERT INTO meals (id, date, name, type, time, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              mealItem.id,
              dayMeals.date,
              mealItem.name,
              mealItem.type,
              mealItem.time || null,
              userId
            ]
          )
        } catch (err: any) {
          console.error('Error inserting meal:', err)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving meals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
