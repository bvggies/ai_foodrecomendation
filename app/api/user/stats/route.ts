import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const userId = session.user.id

    const [favoritesRes, recipesRes, mealsRes, groceriesRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [userId]),
      db.query('SELECT COUNT(*) FROM recipes WHERE created_at IS NOT NULL', []),
      db.query('SELECT COUNT(*) FROM meals WHERE user_id = $1', [userId]),
      db.query('SELECT COUNT(*) FROM grocery_items WHERE user_id = $1', [userId]),
    ])

    return NextResponse.json({
      stats: {
        favorites: parseInt(favoritesRes.rows[0].count),
        recipes: parseInt(recipesRes.rows[0].count),
        meals: parseInt(mealsRes.rows[0].count),
        groceries: parseInt(groceriesRes.rows[0].count),
      },
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
