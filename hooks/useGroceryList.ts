import { FavoriteRecipe } from './useFavorites'

export interface GroceryItem {
  id: string
  name: string
  quantity: string
  category: string
  bought: boolean
}

const categories = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Bakery',
  'Frozen',
  'Beverages',
  'Other',
]

function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase()
  
  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('turkey') ||
    lower.includes('shrimp') ||
    lower.includes('meat')
  ) {
    return 'Meat & Seafood'
  }
  
  if (
    lower.includes('milk') ||
    lower.includes('cheese') ||
    lower.includes('yogurt') ||
    lower.includes('butter') ||
    lower.includes('cream') ||
    lower.includes('egg')
  ) {
    return 'Dairy & Eggs'
  }
  
  if (
    lower.includes('bread') ||
    lower.includes('flour') ||
    lower.includes('pasta') ||
    lower.includes('rice') ||
    lower.includes('cereal') ||
    lower.includes('oats')
  ) {
    return 'Pantry'
  }
  
  if (
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('pepper') ||
    lower.includes('lettuce') ||
    lower.includes('carrot') ||
    lower.includes('potato') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('vegetable') ||
    lower.includes('fruit')
  ) {
    return 'Produce'
  }
  
  if (
    lower.includes('juice') ||
    lower.includes('water') ||
    lower.includes('soda') ||
    lower.includes('coffee') ||
    lower.includes('tea')
  ) {
    return 'Beverages'
  }
  
  return 'Other'
}

export function useGroceryList() {
  const addRecipeToGroceryList = (recipe: FavoriteRecipe) => {
    const existingItems = localStorage.getItem('groceryItems')
    let currentItems: GroceryItem[] = []
    
    if (existingItems) {
      try {
        currentItems = JSON.parse(existingItems)
      } catch (e) {
        console.error('Error loading grocery items:', e)
      }
    }

    // Extract ingredients and add them to the list
    const newItems: GroceryItem[] = recipe.ingredients.map((ingredient) => {
      // Try to extract quantity and name from ingredient string
      const parts = ingredient.split(' - ').length > 1 
        ? ingredient.split(' - ')
        : ingredient.split(',').length > 1
        ? ingredient.split(',')
        : [ingredient]
      
      const quantity = parts.length > 1 ? parts[0].trim() : ''
      const name = parts.length > 1 ? parts.slice(1).join(' ').trim() : parts[0].trim()
      
      const category = categorizeIngredient(name || ingredient)
      
      return {
        id: `${Date.now()}-${Math.random()}`,
        name: name || ingredient,
        quantity: quantity || '',
        category,
        bought: false,
      }
    })

    // Merge with existing items (avoid duplicates)
    const mergedItems = [...currentItems]
    newItems.forEach((newItem) => {
      const exists = mergedItems.some(
        (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
      )
      if (!exists) {
        mergedItems.push(newItem)
      }
    })

    localStorage.setItem('groceryItems', JSON.stringify(mergedItems))
    
    // Trigger storage event so grocery page can update
    window.dispatchEvent(new Event('storage'))
  }

  return {
    addRecipeToGroceryList,
  }
}
