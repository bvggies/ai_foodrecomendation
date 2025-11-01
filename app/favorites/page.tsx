'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Clock, Flame, ArrowRight } from 'lucide-react'
import { useFavorites, FavoriteRecipe } from '@/hooks/useFavorites'

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Favorite Recipes</h1>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">
            Start exploring recipes and save your favorites to access them here
          </p>
          <Link
            href="/recipes"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Browse Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Favorite Recipes</h1>
        <p className="text-gray-600">Your saved recipes ({favorites.length})</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl">{recipe.image || '🍽️'}</div>
              <button
                onClick={() => toggleFavorite(recipe)}
                className="text-red-500 hover:text-red-700"
              >
                <Heart className="w-6 h-6 fill-current" />
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>
            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{recipe.description}</p>
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
            <Link
              href={`/recipes/${recipe.id}`}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              View Recipe
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
