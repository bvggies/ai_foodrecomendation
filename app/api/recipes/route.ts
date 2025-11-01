import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const db = await getDb()
      const result = await db.query('SELECT * FROM recipes WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      
      const recipe = result.rows[0]
      return NextResponse.json({
        recipe: {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          servings: recipe.servings,
          calories: recipe.calories,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          nutrition: recipe.nutrition,
          image: recipe.image,
          dietType: recipe.diet_type,
          cuisine: recipe.cuisine,
        }
      })
    }

    // Get all saved recipes
    const db = await getDb()
    const result = await db.query('SELECT * FROM recipes ORDER BY created_at DESC LIMIT 50')
    return NextResponse.json({ recipes: result.rows })
  } catch (error: any) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { recipe } = await req.json()
    const db = await getDb()

    await db.query(
      `INSERT INTO recipes (id, name, description, prep_time, cook_time, servings, calories, ingredients, instructions, nutrition, image, diet_type, cuisine)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       prep_time = EXCLUDED.prep_time,
       cook_time = EXCLUDED.cook_time,
       servings = EXCLUDED.servings,
       calories = EXCLUDED.calories,
       ingredients = EXCLUDED.ingredients,
       instructions = EXCLUDED.instructions,
       nutrition = EXCLUDED.nutrition,
       image = EXCLUDED.image,
       diet_type = EXCLUDED.diet_type,
       cuisine = EXCLUDED.cuisine`,
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
