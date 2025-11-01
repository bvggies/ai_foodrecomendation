import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const result = await db.query(
      'SELECT * FROM grocery_items WHERE user_id = $1 ORDER BY created_at DESC',
      ['default']
    )
    return NextResponse.json({ items: result.rows })
  } catch (error: any) {
    console.error('Error fetching grocery items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()
    const db = await getDb()

    // Delete existing items
    await db.query('DELETE FROM grocery_items WHERE user_id = $1', ['default'])

    // Insert new items
    for (const item of items) {
      await db.query(
        'INSERT INTO grocery_items (id, name, quantity, category, bought, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.id, item.name, item.quantity || '', item.category, item.bought || false, 'default']
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving grocery items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
