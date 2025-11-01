'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, X } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time?: string
}

interface DayMeals {
  date: Date
  meals: Meal[]
}

export default function PlannerPage() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const [selectedWeek, setSelectedWeek] = useState(weekStart)
  const [meals, setMeals] = useState<DayMeals[]>(
    Array.from({ length: 7 }, (_, i) => ({
      date: addDays(weekStart, i),
      meals: [],
    }))
  )

  // Load meals from localStorage
  useEffect(() => {
    const savedMeals = localStorage.getItem('mealPlanner')
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals)
        // Convert date strings back to Date objects
        const mealsWithDates = parsed.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }))
        setMeals(mealsWithDates)
      } catch (e) {
        console.error('Error loading meal planner:', e)
      }
    }
  }, [])

  // Save meals to localStorage whenever they change
  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem('mealPlanner', JSON.stringify(meals))
    }
  }, [meals])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [newMeal, setNewMeal] = useState({ name: '', type: 'lunch' as Meal['type'], time: '' })

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { value: 'lunch', label: 'Lunch', emoji: '🥗' },
    { value: 'dinner', label: 'Dinner', emoji: '🍽️' },
    { value: 'snack', label: 'Snack', emoji: '🍎' },
  ]

  const openAddModal = (day: Date) => {
    setSelectedDay(day)
    setShowAddModal(true)
    setNewMeal({ name: '', type: 'lunch', time: '' })
  }

  const addMeal = () => {
    if (!selectedDay || !newMeal.name.trim()) return

    setMeals((prev) =>
      prev.map((dayMeals) => {
        if (isSameDay(dayMeals.date, selectedDay)) {
          return {
            ...dayMeals,
            meals: [
              ...dayMeals.meals,
              {
                id: Date.now().toString(),
                name: newMeal.name,
                type: newMeal.type,
                time: newMeal.time || undefined,
              },
            ],
          }
        }
        return dayMeals
      })
    )
    setShowAddModal(false)
  }

  const removeMeal = (dayIndex: number, mealId: string) => {
    setMeals((prev) =>
      prev.map((dayMeals, index) => {
        if (index === dayIndex) {
          return {
            ...dayMeals,
            meals: dayMeals.meals.filter((m) => m.id !== mealId),
          }
        }
        return dayMeals
      })
    )
  }

  const loadWeekMeals = (weekDate: Date) => {
    const savedMeals = localStorage.getItem('mealPlanner')
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals)
        const mealsWithDates = parsed.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }))
        // Find meals for this week
        const weekMeals = Array.from({ length: 7 }, (_, i) => {
          const dayDate = addDays(weekDate, i)
          const savedDay = mealsWithDates.find((m: DayMeals) =>
            isSameDay(new Date(m.date), dayDate)
          )
          return savedDay || { date: dayDate, meals: [] }
        })
        setMeals(weekMeals)
        return
      } catch (e) {
        console.error('Error loading meal planner:', e)
      }
    }
    // If no saved meals, create empty week
    setMeals(
      Array.from({ length: 7 }, (_, i) => ({
        date: addDays(weekDate, i),
        meals: [],
      }))
    )
  }

  const goToPrevWeek = () => {
    const newWeek = addDays(selectedWeek, -7)
    setSelectedWeek(newWeek)
    loadWeekMeals(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = addDays(selectedWeek, 7)
    setSelectedWeek(newWeek)
    loadWeekMeals(newWeek)
  }

  const goToToday = () => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 })
    setSelectedWeek(today)
    loadWeekMeals(today)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Meal Planner</h1>
          <button
            onClick={goToToday}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevWeek}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            ← Previous Week
          </button>
          <div className="text-lg font-semibold">
            {format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d, yyyy')}
          </div>
          <button
            onClick={goToNextWeek}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {meals.map((dayMeals, dayIndex) => (
          <div
            key={dayIndex}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-4 min-h-[400px]"
          >
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">
                {format(dayMeals.date, 'EEE')}
              </div>
              <div
                className={`text-xl font-semibold ${
                  isSameDay(dayMeals.date, new Date())
                    ? 'text-orange-500'
                    : 'text-gray-800'
                }`}
              >
                {format(dayMeals.date, 'd')}
              </div>
            </div>

            <button
              onClick={() => openAddModal(dayMeals.date)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors mb-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>

            <div className="space-y-2">
              {dayMeals.meals.map((meal) => {
                const mealType = mealTypes.find((mt) => mt.value === meal.type)
                return (
                  <div
                    key={meal.id}
                    className="bg-orange-50 rounded-lg p-3 border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{mealType?.emoji}</span>
                        <span className="font-semibold text-sm">{meal.name}</span>
                      </div>
                      <button
                        onClick={() => removeMeal(dayIndex, meal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {meal.time && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {meal.time}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Meal</h2>
            {selectedDay && (
              <p className="text-gray-600 mb-4">
                {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Name
                </label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Salad"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewMeal({ ...newMeal, type: type.value as Meal['type'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        newMeal.type === type.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={addMeal}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
