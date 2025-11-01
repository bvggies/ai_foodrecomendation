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
      loginStats,
      activityStats,
      inputStats,
      topActivities,
      topInputs,
      failedLogins,
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
      // Login stats
      db.query(`
        SELECT 
          COUNT(*) as total_logins,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT ip_address) as unique_ips,
          COUNT(*) FILTER (WHERE success = TRUE) as successful_logins,
          COUNT(*) FILTER (WHERE success = FALSE) as failed_logins
        FROM user_logins
        WHERE login_at >= $1
      `, [cutoffDate]),
      // Activity stats by type
      db.query(`
        SELECT 
          activity_type,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_activities
        WHERE created_at >= $1
        GROUP BY activity_type
        ORDER BY count DESC
      `, [cutoffDate]),
      // Input stats
      db.query(`
        SELECT 
          input_type,
          COUNT(*) as total_inputs,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_inputs
        WHERE created_at >= $1
        GROUP BY input_type
        ORDER BY total_inputs DESC
      `, [cutoffDate]),
      // Top activities
      db.query(`
        SELECT activity_type, COUNT(*) as count
        FROM user_activities
        WHERE created_at >= $1
        GROUP BY activity_type
        ORDER BY count DESC
        LIMIT 10
      `, [cutoffDate]),
      // Top input keywords (simplified - first few words)
      db.query(`
        SELECT 
          SUBSTRING(input_text FROM 1 FOR 50) as keyword,
          COUNT(*) as count
        FROM user_inputs
        WHERE created_at >= $1 AND input_text IS NOT NULL
        GROUP BY SUBSTRING(input_text FROM 1 FOR 50)
        ORDER BY count DESC
        LIMIT 20
      `, [cutoffDate]),
      // Failed login attempts
      db.query(`
        SELECT ip_address, COUNT(*) as count
        FROM user_logins
        WHERE success = FALSE AND login_at >= $1
        GROUP BY ip_address
        ORDER BY count DESC
        LIMIT 10
      `, [cutoffDate]),
    ])

    return NextResponse.json({
      userGrowth: userGrowth.rows,
      recipeActivity: recipeActivity.rows,
      favoriteStats: favoriteStats.rows[0],
      mealPlannerStats: mealPlannerStats.rows[0],
      cuisineDistribution: cuisineDistribution.rows,
      loginStats: loginStats.rows[0],
      activityStats: activityStats.rows,
      inputStats: inputStats.rows,
      topActivities: topActivities.rows,
      topInputs: topInputs.rows,
      failedLogins: failedLogins.rows,
    })
  } catch (error: any) {
    console.error('Error fetching enhanced analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
