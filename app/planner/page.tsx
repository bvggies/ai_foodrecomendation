'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Clock, Plus, X, CheckCircle2, Circle, History, TrendingUp } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time?: string
  completed?: boolean
}

interface DayMeals {
  date: Date
  meals: Meal[]
}

export default function PlannerPage() {
  const { data: session } = useSession()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const [selectedWeek, setSelectedWeek] = useState(weekStart)
  const [meals, setMeals] = useState<DayMeals[]>(
    Array.from({ length: 7 }, (_, i) => ({
      date: addDays(weekStart, i),
      meals: [],
    }))
  )
  // Track if we're currently loading to prevent save loop
  const [isLoading, setIsLoading] = useState(false)

  // Load meals from API or localStorage
  useEffect(() => {
    const loadMeals = async () => {
      setIsLoading(true)
      try {
        if (session?.user) {
          // Load from API
          const startDate = format(addDays(selectedWeek, 0), 'yyyy-MM-dd')
          const endDate = format(addDays(selectedWeek, 6), 'yyyy-MM-dd')
          const response = await fetch(`/api/meals?startDate=${startDate}&endDate=${endDate}`)
          const data = await response.json()
          if (data.meals && Array.isArray(data.meals)) {
            // Group meals by date
            const mealsByDate: { [key: string]: Meal[] } = {}
            data.meals.forEach((m: any) => {
              const dateStr = m.date
              if (!mealsByDate[dateStr]) {
                mealsByDate[dateStr] = []
              }
              mealsByDate[dateStr].push({
                id: m.id,
                name: m.name,
                type: m.type as Meal['type'],
                time: m.time,
                completed: m.completed || false,
              })
            })

            const weekMeals = Array.from({ length: 7 }, (_, i) => {
              const dayDate = addDays(selectedWeek, i)
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              return {
                date: dayDate,
                meals: mealsByDate[dateStr] || [],
              }
            })
            setMeals(weekMeals)
          }
        } else {
          // Load from localStorage
          const savedMeals = localStorage.getItem('mealPlanner')
          if (savedMeals) {
            try {
              const parsed = JSON.parse(savedMeals)
              // Convert date strings back to Date objects
              const mealsWithDates = parsed.map((day: any) => ({
                ...day,
                date: new Date(day.date),
              }))
              
              // Filter meals for the current week
              const weekMeals = Array.from({ length: 7 }, (_, i) => {
                const dayDate = addDays(selectedWeek, i)
                const savedDay = mealsWithDates.find((m: DayMeals) =>
                  isSameDay(new Date(m.date), dayDate)
                )
                return savedDay || { date: dayDate, meals: [] }
              })
              setMeals(weekMeals)
            } catch (e) {
              console.error('Error loading meal planner:', e)
              // Initialize empty week if error
              setMeals(
                Array.from({ length: 7 }, (_, i) => ({
                  date: addDays(selectedWeek, i),
                  meals: [],
                }))
              )
            }
          } else {
            // Initialize empty week if no saved meals
            setMeals(
              Array.from({ length: 7 }, (_, i) => ({
                date: addDays(selectedWeek, i),
                meals: [],
              }))
            )
          }
        }
      } catch (error) {
        console.error('Error loading meals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMeals()
  }, [session, selectedWeek])

  // Note: We now save meals individually when added/updated, not in bulk
  // This prevents overwriting meals from other weeks
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [newMeal, setNewMeal] = useState({ name: '', type: 'lunch' as Meal['type'], time: '' })
  const [showAllMeals, setShowAllMeals] = useState(false)
  const [allMeals, setAllMeals] = useState<any[]>([])

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

  const addMeal = async () => {
    if (!selectedDay || !newMeal.name.trim()) return

    const mealId = `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMealData = {
      id: mealId,
      name: newMeal.name,
      type: newMeal.type,
      time: newMeal.time || undefined,
      completed: false,
    }

    // Optimistically update UI
    setMeals((prev) =>
      prev.map((dayMeals) => {
        if (isSameDay(dayMeals.date, selectedDay)) {
          return {
            ...dayMeals,
            meals: [
              ...dayMeals.meals,
              newMealData,
            ],
          }
        }
        return dayMeals
      })
    )

    setShowAddModal(false)

    // Save to API or localStorage
    if (session?.user) {
      try {
        await fetch('/api/meals/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meal: {
              ...newMealData,
              date: format(selectedDay, 'yyyy-MM-dd'),
            },
          }),
        })
      } catch (error) {
        console.error('Error saving meal:', error)
      }
    } else {
      // Save to localStorage
      const mealsToSave = meals.map(dayMeals => {
        if (isSameDay(dayMeals.date, selectedDay)) {
          return {
            date: dayMeals.date.toISOString(),
            meals: [...dayMeals.meals, newMealData],
          }
        }
        return {
          date: dayMeals.date.toISOString(),
          meals: dayMeals.meals,
        }
      })
      localStorage.setItem('mealPlanner', JSON.stringify(mealsToSave))
    }

    // Reset form
    setNewMeal({ name: '', type: 'lunch', time: '' })
  }

  const removeMeal = async (dayIndex: number, mealId: string) => {
    // Optimistically remove from UI
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

    // Delete from API or localStorage
    if (session?.user) {
      try {
        await fetch(`/api/meals/update?mealId=${mealId}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting meal:', error)
      }
    } else {
      // Update localStorage
      const updatedMeals = meals.map((dayMeals, index) => {
        if (index === dayIndex) {
          return {
            ...dayMeals,
            meals: dayMeals.meals.filter((m) => m.id !== mealId),
          }
        }
        return dayMeals
      })
      const mealsToSave = updatedMeals.map(dayMeals => ({
        date: dayMeals.date.toISOString(),
        meals: dayMeals.meals,
      }))
      localStorage.setItem('mealPlanner', JSON.stringify(mealsToSave))
    }
  }

  const toggleMealCompleted = async (mealId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted
    
    // Optimistically update UI in calendar
    setMeals((prev) =>
      prev.map((dayMeals) => ({
        ...dayMeals,
        meals: dayMeals.meals.map((m) =>
          m.id === mealId ? { ...m, completed: newCompleted } : m
        ),
      }))
    )

    // Also update in all meals view if it's shown
    if (showAllMeals) {
      setAllMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, completed: newCompleted } : m
        )
      )
    }

    if (session?.user) {
      try {
        await fetch('/api/meals/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealId,
            updates: { completed: newCompleted },
          }),
        })
      } catch (error) {
        console.error('Error updating meal:', error)
      }
    }
  }

  const loadAllMeals = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/meals/all?limit=200')
      const data = await response.json()
      if (data.meals) {
        // Convert date strings to Date objects for display
        const mealsWithDates = data.meals.map((meal: any) => ({
          ...meal,
          date: typeof meal.date === 'string' ? meal.date : meal.date.toISOString().split('T')[0],
        }))
        setAllMeals(mealsWithDates)
      }
    } catch (error) {
      console.error('Error loading all meals:', error)
    }
  }

  useEffect(() => {
    if (showAllMeals && session?.user) {
      loadAllMeals()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllMeals, session?.user])

  const goToPrevWeek = () => {
    const newWeek = addDays(selectedWeek, -7)
    setSelectedWeek(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = addDays(selectedWeek, 7)
    setSelectedWeek(newWeek)
  }

  const goToToday = () => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 })
    setSelectedWeek(today)
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">Meal Planner</h1>
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
            {session?.user && (
              <button
                onClick={() => {
                  setShowAllMeals(!showAllMeals)
                  if (!showAllMeals) loadAllMeals()
                }}
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-manipulation min-h-[44px] flex-1 sm:flex-none ${
                  showAllMeals
                    ? 'bg-purple-500 text-white active:bg-purple-600'
                    : 'bg-gray-200 text-gray-700 active:bg-gray-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="text-sm md:text-base">{showAllMeals ? 'Hide All Meals' : 'View All Meals'}</span>
              </button>
            )}
            <button
              onClick={goToToday}
              className="bg-orange-500 text-white px-3 md:px-4 py-2 rounded-lg active:bg-orange-600 transition-colors touch-manipulation min-h-[44px] flex-1 sm:flex-none"
            >
              Today
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            onClick={goToPrevWeek}
            className="text-orange-500 active:text-orange-600 font-semibold touch-manipulation min-h-[44px] px-2 md:px-0 text-sm md:text-base"
          >
            ← <span className="hidden sm:inline">Previous Week</span><span className="sm:hidden">Prev</span>
          </button>
          <div className="text-base md:text-lg font-semibold text-center px-2">
            <div className="hidden sm:block">{format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d, yyyy')}</div>
            <div className="sm:hidden text-xs">{format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d')}</div>
          </div>
          <button
            onClick={goToNextWeek}
            className="text-orange-500 active:text-orange-600 font-semibold touch-manipulation min-h-[44px] px-2 md:px-0 text-sm md:text-base"
          >
            <span className="hidden sm:inline">Next Week</span><span className="sm:hidden">Next</span> →
          </button>
        </div>
      </div>

      {/* All Meals View */}
      {showAllMeals && session?.user && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-500" />
            All My Meals
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMeals.map((meal: any) => (
              <div
                key={meal.id}
                className={`p-4 rounded-lg border-2 ${
                  meal.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {mealTypes.find(mt => mt.value === meal.type)?.emoji || '🍽️'}
                      </span>
                      <span className={`font-semibold ${meal.completed ? 'line-through text-gray-500' : ''}`}>
                        {meal.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(meal.date + 'T00:00:00'), 'MMM d, yyyy')}
                      {meal.time && ` • ${meal.time}`}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMealCompleted(meal.id, meal.completed || false)}
                    className={`ml-2 p-1 rounded transition-colors ${
                      meal.completed
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-orange-500'
                    }`}
                    title={meal.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {meal.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {allMeals.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No meals found. Start planning by adding meals to your calendar!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 overflow-x-auto pb-2">
        {meals.map((dayMeals, dayIndex) => (
          <div
            key={dayIndex}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-2 md:p-4 min-h-[300px] md:min-h-[400px]"
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
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 md:p-3 text-gray-500 active:border-orange-500 active:text-orange-500 transition-colors mb-3 md:mb-4 flex items-center justify-center gap-2 touch-manipulation min-h-[44px] text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Meal</span>
              <span className="sm:hidden">Add</span>
            </button>

            <div className="space-y-2">
              {dayMeals.meals.map((meal) => {
                const mealType = mealTypes.find((mt) => mt.value === meal.type)
                const isCompleted = meal.completed || false
                return (
                  <div
                    key={meal.id}
                    className={`rounded-lg p-3 border-2 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => toggleMealCompleted(meal.id, isCompleted)}
                          className={`transition-colors ${
                            isCompleted
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-orange-500'
                          }`}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span>{mealType?.emoji}</span>
                        <span className={`font-semibold text-sm flex-1 ${
                          isCompleted ? 'line-through text-gray-500' : ''
                        }`}>
                          {meal.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMeal(dayIndex, meal.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Delete meal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {meal.time && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
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

      {/* Statistics Section */}
      {(() => {
        // Calculate statistics from current week's meals
        const allWeekMeals = meals.flatMap(dayMeals => dayMeals.meals)
        const totalMeals = allWeekMeals.length
        const completedMeals = allWeekMeals.filter(m => m.completed).length
        const pendingMeals = totalMeals - completedMeals
        const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0
        
        // Count by meal type
        const mealTypeCounts = mealTypes.map(type => ({
          ...type,
          count: allWeekMeals.filter(m => m.type === type.value).length,
        }))
        
        // Meals with times set
        const mealsWithTime = allWeekMeals.filter(m => m.time).length
        
        // Days with meals
        const daysWithMeals = meals.filter(day => day.meals.length > 0).length

        return (
          <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              Week Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {/* Total Meals */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-gray-600 mb-1">Total Meals</div>
                <div className="text-3xl font-bold text-orange-600">{totalMeals}</div>
                <div className="text-xs text-gray-500 mt-1">This week</div>
              </div>

              {/* Completed Meals */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-600">{completedMeals}</div>
                <div className="text-xs text-gray-500 mt-1">{completionRate}% done</div>
              </div>

              {/* Pending Meals */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-3xl font-bold text-yellow-600">{pendingMeals}</div>
                <div className="text-xs text-gray-500 mt-1">To complete</div>
              </div>

              {/* Days Planned */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Days Planned</div>
                <div className="text-3xl font-bold text-blue-600">{daysWithMeals}</div>
                <div className="text-xs text-gray-500 mt-1">of 7 days</div>
              </div>

              {/* Meals with Time */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Scheduled</div>
                <div className="text-3xl font-bold text-purple-600">{mealsWithTime}</div>
                <div className="text-xs text-gray-500 mt-1">with time</div>
              </div>

              {/* Completion Progress Bar */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 md:p-4 border border-gray-200 md:col-span-3 lg:col-span-1">
                <div className="text-sm text-gray-600 mb-2">Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{completionRate}% complete</div>
              </div>
            </div>

            {/* Meal Type Distribution */}
            {mealTypeCounts.some(type => type.count > 0) && (
              <div className="mt-4 md:mt-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Meal Type Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {mealTypeCounts.map(type => {
                    const percentage = totalMeals > 0 ? Math.round((type.count / totalMeals) * 100) : 0
                    return (
                      <div
                        key={type.value}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{type.emoji}</span>
                            <span className="font-semibold text-sm">{type.label}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-700">{type.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{percentage}% of meals</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalMeals === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No meals planned this week</p>
                <p className="text-sm mt-1">Start planning by adding meals to any day!</p>
              </div>
            )}
          </div>
        )
      })()}

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full my-auto">
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

            <div className="flex gap-3 md:gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg active:bg-gray-50 transition-colors font-semibold touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={addMeal}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg active:bg-orange-600 transition-colors font-semibold touch-manipulation min-h-[44px]"
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
