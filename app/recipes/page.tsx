'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Clock, Flame, Utensils } from 'lucide-react'

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const featuredRecipes = [
    {
      id: 1,
      name: 'Mediterranean Quinoa Bowl',
      description: 'Healthy and protein-packed with fresh vegetables',
      prepTime: 15,
      cookTime: 20,
      calories: 350,
      image: '🥗',
    },
    {
      id: 2,
      name: 'Chicken Teriyaki Stir Fry',
      description: 'Quick and flavorful Asian-inspired dish',
      prepTime: 10,
      cookTime: 15,
      calories: 420,
      image: '🍱',
    },
    {
      id: 3,
      name: 'Vegetarian Pasta Primavera',
      description: 'Light pasta with seasonal vegetables',
      prepTime: 15,
      cookTime: 20,
      calories: 380,
      image: '🍝',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Recipes</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Link
            href="/recipes/generator"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Generate Recipe
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Featured Recipes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>

      <div className="bg-orange-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">Want personalized recipe recommendations?</p>
        <Link
          href="/assistant"
          className="text-orange-500 font-semibold hover:underline"
        >
          Chat with AI Assistant →
        </Link>
      </div>
    </div>
  )
}

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
      <div className="text-6xl mb-4">{recipe.image}</div>
      <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>
      <p className="text-gray-600 mb-4 text-sm">{recipe.description}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {recipe.prepTime} min prep
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="w-4 h-4" />
          {recipe.cookTime} min cook
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4" />
          {recipe.calories} cal
        </div>
      </div>
      <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
        View Recipe
      </button>
    </div>
  )
}
