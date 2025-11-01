import { NextRequest, NextResponse } from 'next/server'
import { getGhanaianFoods, findFoodByName, findFoodsByIngredients } from '@/lib/food-knowledge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const ingredients = searchParams.get('ingredients')

    if (query) {
      // Search by name
      const result = findFoodByName(query)
      if (result) {
        return NextResponse.json({ food: result })
      }
      
      // Search in all foods
      const allFoods = getGhanaianFoods()
      const matching = allFoods.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.description.toLowerCase().includes(query.toLowerCase()) ||
        food.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
      
      return NextResponse.json({ foods: matching })
    }

    if (ingredients) {
      const ingredientsList = ingredients.split(',').map((i) => i.trim())
      const results = findFoodsByIngredients(ingredientsList)
      return NextResponse.json({ foods: results })
    }

    // Return all foods
    const allFoods = getGhanaianFoods()
    return NextResponse.json({ foods: allFoods })
  } catch (error: any) {
    console.error('Error searching foods:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
