import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

/**
 * Check database connection and user count
 * Useful for debugging deployment issues
 */
export async function GET() {
  try {
    const db = await getDb()
    
    // Check connection
    await db.query('SELECT 1')
    
    // Count users
    const userCount = await db.query('SELECT COUNT(*) as count FROM users')
    const adminCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
    
    // Check if tables exist
    const tablesCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'recipes', 'favorites', 'grocery_items', 'meals')
    `)

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        usersTableExists: tablesCheck.rows.some(t => t.table_name === 'users'),
        totalUsers: parseInt(userCount.rows[0].count),
        totalAdmins: parseInt(adminCount.rows[0].count),
        existingTables: tablesCheck.rows.map(t => t.table_name),
      },
      message: parseInt(adminCount.rows[0].count) > 0 
        ? `Database connected. ${userCount.rows[0].count} users found, ${adminCount.rows[0].count} admins.`
        : `Database connected but no admin accounts found. Seed accounts using /api/admin/seed-production?secret=YOUR_SECRET`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Check DATABASE_URL environment variable in Vercel settings',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
