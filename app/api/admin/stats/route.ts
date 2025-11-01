import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      usersCount,
      adminsCount,
      recipesCount,
      favoritesCount,
      mealsCount,
      groceriesCount,
      activeUsersToday,
      recipesToday,
      recentUsers,
      topRecipes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
      db.query('SELECT COUNT(*) as count FROM recipes'),
      db.query('SELECT COUNT(*) as count FROM favorites'),
      db.query('SELECT COUNT(*) as count FROM meals'),
      db.query('SELECT COUNT(*) as count FROM grocery_items'),
      db.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM favorites WHERE created_at >= $1`,
        [today]
      ),
      db.query(
        `SELECT COUNT(*) as count FROM recipes WHERE created_at >= $1`,
        [today]
      ),
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
        totalAdmins: parseInt(adminsCount.rows[0].count),
        totalRecipes: parseInt(recipesCount.rows[0].count),
        totalFavorites: parseInt(favoritesCount.rows[0].count),
        totalMeals: parseInt(mealsCount.rows[0].count),
        totalGroceries: parseInt(groceriesCount.rows[0].count),
        activeUsersToday: parseInt(activeUsersToday.rows[0].count || '0'),
        recipesToday: parseInt(recipesToday.rows[0].count || '0'),
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
