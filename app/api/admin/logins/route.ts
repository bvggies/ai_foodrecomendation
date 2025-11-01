import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const userId = searchParams.get('userId') || null

    const db = await getDb()

    let query = `
      SELECT 
        ul.*,
        u.name as user_name,
        u.email as user_email
      FROM user_logins ul
      LEFT JOIN users u ON ul.user_id = u.id
    `
    const params: any[] = []

    if (userId) {
      query += ' WHERE ul.user_id = $1'
      params.push(parseInt(userId))
    }

    query += ' ORDER BY ul.login_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)

    const result = await db.query(query, params)

    // Get unique IPs and their counts
    const ipStatsQuery = userId
      ? 'SELECT ip_address, COUNT(*) as count, MAX(login_at) as last_login FROM user_logins WHERE user_id = $1 GROUP BY ip_address ORDER BY count DESC'
      : 'SELECT ip_address, COUNT(*) as count, MAX(login_at) as last_login FROM user_logins GROUP BY ip_address ORDER BY count DESC LIMIT 20'

    const ipStats = await db.query(ipStatsQuery, userId ? [parseInt(userId)] : [])

    return NextResponse.json({
      logins: result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name || 'Failed Login',
        userEmail: row.user_email,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        loginAt: row.login_at,
        success: row.success,
      })),
      ipStats: ipStats.rows.map((row: any) => ({
        ipAddress: row.ip_address,
        count: parseInt(row.count),
        lastLogin: row.last_login,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching logins:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logins' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
