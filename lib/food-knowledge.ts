import ghanaianFoods from '@/data/ghanaian-foods.json'

export interface FoodItem {
  name: string
  description: string
  ingredients: string[]
  cuisine: string
  prepTime: number
  cookTime: number
  calories: number
  image: string
  dietType: string
  tags: string[]
}

export function getGhanaianFoods(): FoodItem[] {
  return ghanaianFoods.foods as FoodItem[]
}

export function findFoodByName(name: string): FoodItem | undefined {
  const foods = getGhanaianFoods()
  return foods.find(
    (food) =>
      food.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(food.name.toLowerCase())
  )
}

export function findFoodsByIngredients(ingredients: string[]): FoodItem[] {
  const foods = getGhanaianFoods()
  const searchTerms = ingredients.map((i) => i.toLowerCase())

  return foods.filter((food) => {
    const foodIngredients = food.ingredients.map((i) => i.toLowerCase())
    return searchTerms.some((term) =>
      foodIngredients.some((fi) => fi.includes(term) || term.includes(fi))
    )
  })
}

export function getFoodKnowledgeBase(): string {
  const foods = getGhanaianFoods()
  let knowledge = 'Ghanaian Food Knowledge Base:\n\n'

  foods.forEach((food, index) => {
    knowledge += `${index + 1}. ${food.name}:\n`
    knowledge += `   - Description: ${food.description}\n`
    knowledge += `   - Ingredients: ${food.ingredients.join(', ')}\n`
    knowledge += `   - Prep Time: ${food.prepTime} minutes\n`
    knowledge += `   - Cook Time: ${food.cookTime} minutes\n`
    knowledge += `   - Calories: ~${food.calories} per serving\n`
    knowledge += `   - Diet Type: ${food.dietType}\n`
    knowledge += `   - Tags: ${food.tags.join(', ')}\n\n`
  })

  return knowledge
}

export function getFoodSuggestions(userIngredients: string[]): FoodItem[] {
  return findFoodsByIngredients(userIngredients).slice(0, 5)
}
