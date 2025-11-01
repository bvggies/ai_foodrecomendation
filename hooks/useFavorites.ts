import { useState, useEffect } from 'react'

export interface FavoriteRecipe {
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

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('favoriteRecipes')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  const saveFavorites = (newFavorites: FavoriteRecipe[]) => {
    setFavorites(newFavorites)
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites))
  }

  const toggleFavorite = (recipe: FavoriteRecipe) => {
    const isCurrentlyFavorite = favorites.some((f) => f.id === recipe.id)
    if (isCurrentlyFavorite) {
      saveFavorites(favorites.filter((f) => f.id !== recipe.id))
    } else {
      saveFavorites([...favorites, recipe])
    }
  }

  const isFavorite = (recipeId: string) => {
    return favorites.some((f) => f.id === recipeId)
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  }
}
