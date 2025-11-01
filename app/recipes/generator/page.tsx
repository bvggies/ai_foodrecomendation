'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, Clock, Utensils, Flame, Users, BookOpen, Heart, ShoppingCart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useGroceryList } from '@/hooks/useGroceryList'

interface Recipe {
  id?: string
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

export default function RecipeGeneratorPage() {
  const router = useRouter()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addRecipeToGroceryList } = useGroceryList()
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [dietType, setDietType] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState('')

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredient()
    }
  }

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient')
      return
    }

    setIsLoading(true)
    setError('')
    setRecipe(null)

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          dietType,
          cuisine,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recipe')
      }

      const data = await response.json()
      // Add ID and save to localStorage
      const recipeWithId = {
        ...data.recipe,
        id: `recipe-${Date.now()}`,
        dietType: dietType || undefined,
        cuisine: cuisine || undefined,
      }
      setRecipe(recipeWithId)
      
      // Save to localStorage for later viewing
      const savedRecipes = localStorage.getItem('savedRecipes')
      let recipes: Recipe[] = []
      if (savedRecipes) {
        try {
          recipes = JSON.parse(savedRecipes)
        } catch (e) {
          console.error('Error loading saved recipes:', e)
        }
      }
      recipes.unshift(recipeWithId) // Add to beginning
      // Keep only last 50 recipes
      if (recipes.length > 50) {
        recipes = recipes.slice(0, 50)
      }
      localStorage.setItem('savedRecipes', JSON.stringify(recipes))
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Recipe Generator</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">What ingredients do you have?</h2>

        {/* Ingredients Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Ingredients
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., chicken, rice, tomatoes..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={addIngredient}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="hover:text-orange-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diet Type (Optional)
            </label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="halal">Halal</option>
              <option value="paleo">Paleo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine (Optional)
            </label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Any</option>
              <option value="italian">Italian</option>
              <option value="asian">Asian</option>
              <option value="mexican">Mexican</option>
              <option value="indian">Indian</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="american">American</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRecipe}
          disabled={isLoading || ingredients.length === 0}
          className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            'Generate Recipe'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}
      </div>

      {/* Generated Recipe */}
      {recipe && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">{recipe.name}</h2>
          <p className="text-gray-600 mb-6">{recipe.description}</p>

          {/* Recipe Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          {recipe.id && (
            <div className="flex gap-4 mb-8 pb-8 border-b border-gray-200">
              <button
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                View Full Recipe
              </button>
              <button
                onClick={() => recipe.id && toggleFavorite(recipe as any)}
                className={`px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                  recipe.id && isFavorite(recipe.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${recipe.id && isFavorite(recipe.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  addRecipeToGroceryList(recipe as any)
                  alert('Ingredients added to grocery list!')
                }}
                className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-2xl font-semibold mb-4">Nutrition per Serving</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="text-xl font-semibold">{recipe.nutrition.protein}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Carbs</div>
                  <div className="text-xl font-semibold">{recipe.nutrition.carbs}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fat</div>
                  <div className="text-xl font-semibold">{recipe.nutrition.fat}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
