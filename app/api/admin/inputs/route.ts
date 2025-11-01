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
    const inputType = searchParams.get('type') || null

    const db = await getDb()

    let query = `
      SELECT 
        ui.*,
        u.name as user_name,
        u.email as user_email
      FROM user_inputs ui
      LEFT JOIN users u ON ui.user_id = u.id
    `
    const params: any[] = []

    if (inputType) {
      query += ' WHERE ui.input_type = $1'
      params.push(inputType)
    }

    query += ' ORDER BY ui.created_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)

    const result = await db.query(query, params)

    // Get top queries/keywords
    const topQueriesQuery = inputType
      ? `SELECT input_text, COUNT(*) as count 
         FROM user_inputs 
         WHERE input_type = $1 AND input_text IS NOT NULL
         GROUP BY input_text 
         ORDER BY count DESC 
         LIMIT 20`
      : `SELECT input_text, COUNT(*) as count 
         FROM user_inputs 
         WHERE input_text IS NOT NULL
         GROUP BY input_text 
         ORDER BY count DESC 
         LIMIT 20`

    const topQueries = await db.query(topQueriesQuery, inputType ? [inputType] : [])

    // Get input type distribution
    const typeDistribution = await db.query(`
      SELECT input_type, COUNT(*) as count
      FROM user_inputs
      GROUP BY input_type
      ORDER BY count DESC
    `)

    return NextResponse.json({
      inputs: result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name || 'Anonymous',
        userEmail: row.user_email,
        inputType: row.input_type,
        inputText: row.input_text,
        context: row.context,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
      })),
      topQueries: topQueries.rows.map((row: any) => ({
        text: row.input_text,
        count: parseInt(row.count),
      })),
      typeDistribution: typeDistribution.rows.map((row: any) => ({
        type: row.input_type,
        count: parseInt(row.count),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching inputs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inputs' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
