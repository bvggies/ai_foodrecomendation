import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const activityType = searchParams.get('type') || null

    const db = await getDb()

    let query = `
      SELECT 
        ua.*,
        u.name as user_name,
        u.email as user_email
      FROM user_activities ua
      LEFT JOIN users u ON ua.user_id = u.id
    `
    const params: any[] = []

    if (activityType) {
      query += ' WHERE ua.activity_type = $1'
      params.push(activityType)
    }

    query += ' ORDER BY ua.created_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)

    const result = await db.query(query, params)

    return NextResponse.json({
      activities: result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name || 'Anonymous',
        userEmail: row.user_email,
        activityType: row.activity_type,
        activityData: row.activity_data,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
