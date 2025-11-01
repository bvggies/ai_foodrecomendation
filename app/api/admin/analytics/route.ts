import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30' // days

    const db = await getDb()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period))

    const [
      userGrowth,
      recipeActivity,
      favoriteStats,
      mealPlannerStats,
      cuisineDistribution,
    ] = await Promise.all([
      // User growth
      db.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM users 
         WHERE created_at >= $1 
         GROUP BY DATE(created_at) 
         ORDER BY date ASC`,
        [cutoffDate]
      ),
      // Recipe activity
      db.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM recipes 
         WHERE created_at >= $1 
         GROUP BY DATE(created_at) 
         ORDER BY date ASC`,
        [cutoffDate]
      ),
      // Favorite stats
      db.query(`
        SELECT 
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_favorites,
          COUNT(DISTINCT recipe_id) as unique_recipes
        FROM favorites
      `),
      // Meal planner stats
      db.query(`
        SELECT 
          COUNT(DISTINCT user_id) as active_users,
          COUNT(*) as total_meals,
          COUNT(DISTINCT date) as unique_dates
        FROM meals
        WHERE created_at >= $1
      `, [cutoffDate]),
      // Cuisine distribution
      db.query(`
        SELECT cuisine, COUNT(*) as count
        FROM recipes
        WHERE cuisine IS NOT NULL
        GROUP BY cuisine
        ORDER BY count DESC
        LIMIT 10
      `),
    ])

    return NextResponse.json({
      userGrowth: userGrowth.rows,
      recipeActivity: recipeActivity.rows,
      favoriteStats: favoriteStats.rows[0],
      mealPlannerStats: mealPlannerStats.rows[0],
      cuisineDistribution: cuisineDistribution.rows,
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
