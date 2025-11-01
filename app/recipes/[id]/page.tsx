'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Utensils, Flame, Users, Heart, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useGroceryList } from '@/hooks/useGroceryList'

interface Recipe {
  id: string
  name: string
  description: string
  prepTime: number
  cookTime: number
  servings: number
  calories: number
  ingredients: string[]
  instructions: string[]
  nutrition?: {
    protein: string
    carbs: string
    fat: string
  }
  image?: string
  dietType?: string
  cuisine?: string
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { addRecipeToGroceryList } = useGroceryList()

  useEffect(() => {
    // Try to get recipe from localStorage (saved recipes)
    const savedRecipes = localStorage.getItem('savedRecipes')
    if (savedRecipes) {
      try {
        const recipes = JSON.parse(savedRecipes)
        const foundRecipe = recipes.find((r: Recipe) => r.id === recipeId)
        if (foundRecipe) {
          setRecipe(foundRecipe)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Error loading recipe:', e)
      }
    }

    // If not found, show error or redirect
    setLoading(false)
  }, [recipeId])

  const handleAddToGroceryList = () => {
    if (recipe) {
      addRecipeToGroceryList(recipe)
      alert('Ingredients added to grocery list!')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-2xl">Loading recipe...</div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-2xl mb-4">Recipe not found</div>
        <button
          onClick={() => router.push('/recipes')}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Recipes
        </button>
      </div>
    )
  }

  const favorite = isFavorite(recipeId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
          {recipe.image && (
            <div className="text-8xl mb-4 text-center">{recipe.image}</div>
          )}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
              <p className="text-orange-100 text-lg">{recipe.description}</p>
            </div>
            <button
              onClick={() => toggleFavorite(recipe)}
              className={`p-3 rounded-full transition-colors ${
                favorite
                  ? 'bg-white text-red-500'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
            >
              <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          {(recipe.dietType || recipe.cuisine) && (
            <div className="flex gap-2 mt-4">
              {recipe.dietType && (
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {recipe.dietType}
                </span>
              )}
              {recipe.cuisine && (
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {recipe.cuisine}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Recipe Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm">Prep Time</div>
                <div className="font-semibold">{recipe.prepTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Utensils className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm">Cook Time</div>
                <div className="font-semibold">{recipe.cookTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm">Servings</div>
                <div className="font-semibold">{recipe.servings}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm">Calories</div>
                <div className="font-semibold">{recipe.calories}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToGroceryList}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Grocery List
            </button>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-6">Ingredients</h2>
            <div className="bg-orange-50 rounded-xl p-6">
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1 font-bold">•</span>
                    <span className="text-gray-700 text-lg">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-6">Instructions</h2>
            <ol className="space-y-6">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-6">
                  <span className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-2 text-gray-700 text-lg leading-relaxed">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-3xl font-semibold mb-6">Nutrition per Serving</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Protein</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {recipe.nutrition.protein}
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Carbs</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {recipe.nutrition.carbs}
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Fat</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {recipe.nutrition.fat}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
