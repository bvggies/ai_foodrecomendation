import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()

    const [
      usersCount,
      recipesCount,
      favoritesCount,
      mealsCount,
      groceriesCount,
      recentUsers,
      topRecipes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM recipes'),
      db.query('SELECT COUNT(*) as count FROM favorites'),
      db.query('SELECT COUNT(*) as count FROM meals'),
      db.query('SELECT COUNT(*) as count FROM grocery_items'),
      db.query(
        'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      ),
      db.query(`
        SELECT r.id, r.name, COUNT(f.id) as favorite_count
        FROM recipes r
        LEFT JOIN favorites f ON r.id = f.recipe_id
        GROUP BY r.id, r.name
        ORDER BY favorite_count DESC
        LIMIT 5
      `),
    ])

    return NextResponse.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalRecipes: parseInt(recipesCount.rows[0].count),
        totalFavorites: parseInt(favoritesCount.rows[0].count),
        totalMeals: parseInt(mealsCount.rows[0].count),
        totalGroceries: parseInt(groceriesCount.rows[0].count),
      },
      recentUsers: recentUsers.rows,
      topRecipes: topRecipes.rows,
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
