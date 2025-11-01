import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const db = await getDb()

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as count FROM recipes')
    const total = parseInt(countResult.rows[0].count)

    // Get recipes
    const result = await db.query(
      `SELECT id, name, description, prep_time, cook_time, servings, calories, 
              cuisine, diet_type, created_at
       FROM recipes 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return NextResponse.json({
      recipes: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipes' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const recipeId = searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }

    const db = await getDb()

    // Delete from favorites first (cascade should handle this, but being explicit)
    await db.query('DELETE FROM favorites WHERE recipe_id = $1', [recipeId])

    // Delete recipe
    await db.query('DELETE FROM recipes WHERE id = $1', [recipeId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete recipe' },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
