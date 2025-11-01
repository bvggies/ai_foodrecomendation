import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface FavoriteRecipe {
  id: string
  name: string
  description: string
  prepTime?: number | string
  cookTime?: number | string
  servings?: number
  calories?: number
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
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])

  useEffect(() => {
    if (session?.user) {
      // Load from API
      fetch('/api/favorites')
        .then((res) => res.json())
        .then((data) => {
          if (data.favorites) {
            const formatted = data.favorites.map((f: any) => ({
              id: f.id,
              name: f.name,
              description: f.description,
              prepTime: f.prep_time,
              cookTime: f.cook_time,
              servings: f.servings,
              calories: f.calories,
              ingredients: f.ingredients || [],
              instructions: f.instructions || [],
              nutrition: typeof f.nutrition === 'string' ? JSON.parse(f.nutrition) : f.nutrition,
              image: f.image,
              dietType: f.diet_type,
              cuisine: f.cuisine,
            }))
            setFavorites(formatted)
          }
        })
        .catch((err) => console.error('Error loading favorites:', err))
    } else {
      // Load from localStorage
      const saved = localStorage.getItem('favoriteRecipes')
      if (saved) {
        try {
          setFavorites(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading favorites:', e)
        }
      }
    }
  }, [session])

  const toggleFavorite = async (recipe: FavoriteRecipe) => {
    const isCurrentlyFavorite = favorites.some((f) => f.id === recipe.id)

    if (session?.user) {
      // Use API
      try {
        if (isCurrentlyFavorite) {
          await fetch(`/api/favorites?recipeId=${recipe.id}`, { method: 'DELETE' })
          setFavorites(favorites.filter((f) => f.id !== recipe.id))
        } else {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe }),
          })
          setFavorites([...favorites, recipe])
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    } else {
      // Use localStorage
      const newFavorites = isCurrentlyFavorite
        ? favorites.filter((f) => f.id !== recipe.id)
        : [...favorites, recipe]
      setFavorites(newFavorites)
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites))
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
