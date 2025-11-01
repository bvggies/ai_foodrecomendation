import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * Update a meal (e.g., mark as completed, change time, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealId, updates } = await req.json()

    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    const db = await getDb()

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.completed !== undefined) {
      updateFields.push(`completed = $${paramCount++}`)
      values.push(updates.completed)
    }

    if (updates.name) {
      updateFields.push(`name = $${paramCount++}`)
      values.push(updates.name)
    }

    if (updates.type) {
      updateFields.push(`type = $${paramCount++}`)
      values.push(updates.type)
    }

    if (updates.time !== undefined) {
      updateFields.push(`time = $${paramCount++}`)
      values.push(updates.time || null)
    }

    if (updates.date) {
      updateFields.push(`date = $${paramCount++}`)
      values.push(updates.date)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    values.push(mealId, userId)

    await db.query(
      `UPDATE meals SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`,
      values
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating meal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Delete a single meal
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mealId = searchParams.get('mealId')

    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    const db = await getDb()
    await db.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [mealId, userId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting meal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

