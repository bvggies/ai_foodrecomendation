import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    if (!userId) {
      return NextResponse.json({ favorites: [] })
    }

    const db = await getDb()
    const result = await db.query(
      'SELECT r.* FROM recipes r INNER JOIN favorites f ON r.id = f.recipe_id WHERE f.user_id = $1 ORDER BY f.created_at DESC',
      [userId]
    )
    return NextResponse.json({ favorites: result.rows })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipe } = await req.json()
    const db = await getDb()

    // Save recipe if not exists
    await db.query(
      `INSERT INTO recipes (id, name, description, prep_time, cook_time, servings, calories, ingredients, instructions, nutrition, image, diet_type, cuisine)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        recipe.id,
        recipe.name,
        recipe.description,
        recipe.prepTime,
        recipe.cookTime,
        recipe.servings,
        recipe.calories,
        recipe.ingredients,
        recipe.instructions,
        JSON.stringify(recipe.nutrition || {}),
        recipe.image || null,
        recipe.dietType || null,
        recipe.cuisine || null,
      ]
    )

    // Add to favorites
    await db.query(
      'INSERT INTO favorites (recipe_id, user_id) VALUES ($1, $2) ON CONFLICT (recipe_id, user_id) DO NOTHING',
      [recipe.id, userId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const recipeId = searchParams.get('recipeId')
    
    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })
    }

    const db = await getDb()
    await db.query('DELETE FROM favorites WHERE recipe_id = $1 AND user_id = $2', [recipeId, userId])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
