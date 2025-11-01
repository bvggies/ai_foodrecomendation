'use client'

import { useState } from 'react'
import { ChefHat, Heart, Clock, Flame, Loader2 } from 'lucide-react'

interface Recommendation {
  name: string
  description: string
  prepTime: number
  cookTime: number
  calories: number
  image: string
  dietType?: string
  cuisine?: string
}

export default function RecommendationsPage() {
  const [preferences, setPreferences] = useState({
    dietType: '',
    healthGoal: '',
    cuisine: '',
    maxCalories: '',
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const dietTypes = [
    { value: '', label: 'None' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'paleo', label: 'Paleo' },
  ]

  const healthGoals = [
    { value: '', label: 'None' },
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'muscle-gain', label: 'Muscle Gain' },
    { value: 'heart-healthy', label: 'Heart Healthy' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-carb', label: 'Low Carb' },
  ]

  const cuisines = [
    { value: '', label: 'Any' },
    { value: 'ghanaian', label: 'Ghanaian' },
    { value: 'italian', label: 'Italian' },
    { value: 'asian', label: 'Asian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'american', label: 'American' },
  ]

  const getRecommendations = async () => {
    setIsLoading(true)
    setRecommendations([])

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Personalized Recommendations</h1>
        <p className="text-gray-600 text-lg">
          Get recipe suggestions tailored to your diet preferences and health goals
        </p>
      </div>

      {/* Preferences Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Tell us about your preferences</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diet Type
            </label>
            <select
              value={preferences.dietType}
              onChange={(e) => setPreferences({ ...preferences, dietType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {dietTypes.map((diet) => (
                <option key={diet.value} value={diet.value}>
                  {diet.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Goal
            </label>
            <select
              value={preferences.healthGoal}
              onChange={(e) => setPreferences({ ...preferences, healthGoal: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {healthGoals.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Cuisine
            </label>
            <select
              value={preferences.cuisine}
              onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Calories (Optional)
            </label>
            <input
              type="number"
              value={preferences.maxCalories}
              onChange={(e) => setPreferences({ ...preferences, maxCalories: e.target.value })}
              placeholder="e.g., 500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Getting Recommendations...
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5" />
              Get Recommendations
            </>
          )}
        </button>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recommended Recipes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recipe, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
              >
                <div className="text-6xl mb-4">{recipe.image}</div>
                <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{recipe.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.prepTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {recipe.calories} cal
                  </div>
                </div>
                {recipe.dietType && (
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mb-2 mr-2">
                    {recipe.dietType}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {recipe.cuisine}
                  </span>
                )}
              <button
                onClick={() => {
                  // Save recipe and navigate to detail page
                  const recipeWithId = {
                    ...recipe,
                    id: `recipe-${Date.now()}-${index}`,
                  }
                  const savedRecipes = localStorage.getItem('savedRecipes')
                  let recipes: any[] = []
                  if (savedRecipes) {
                    try {
                      recipes = JSON.parse(savedRecipes)
                    } catch (e) {
                      console.error('Error loading saved recipes:', e)
                    }
                  }
                  recipes.unshift(recipeWithId)
                  if (recipes.length > 50) {
                    recipes = recipes.slice(0, 50)
                  }
                  localStorage.setItem('savedRecipes', JSON.stringify(recipes))
                  window.location.href = `/recipes/${recipeWithId.id}`
                }}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold mt-4"
              >
                View Recipe
              </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && recommendations.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            Fill in your preferences and click "Get Recommendations" to see personalized recipes
          </p>
        </div>
      )}
    </div>
  )
}
