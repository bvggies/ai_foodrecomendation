'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Logo from '@/components/Logo'
import { 
  User, 
  LogOut, 
  Utensils, 
  Heart, 
  Calendar, 
  ShoppingCart,
  Settings,
  Loader2
} from 'lucide-react'

interface UserPreferences {
  diet_preferences: string[]
  allergies: string[]
  health_goals: string[]
  favorite_cuisines: string[]
  ai_provider?: string
  notes: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>({
    diet_preferences: [],
    allergies: [],
    health_goals: [],
    favorite_cuisines: [],
    ai_provider: 'openai',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    favorites: 0,
    recipes: 0,
    meals: 0,
    groceries: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user) {
      // Check if user is admin and redirect to admin panel
      fetch('/api/admin/check')
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin) {
            router.push('/admin')
          }
        })
        .catch(() => {
          // If check fails, stay on dashboard
        })
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData()
    }
  }, [session])

  const loadUserData = async () => {
    try {
      const [prefsRes, statsRes] = await Promise.all([
        fetch('/api/user/preferences'),
        fetch('/api/user/stats'),
      ])

      if (prefsRes.ok) {
        const prefsData = await prefsRes.json()
        if (prefsData.preferences) {
          setPreferences(prefsData.preferences)
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        alert('Preferences saved successfully!')
      } else {
        alert('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Error saving preferences')
    } finally {
      setSaving(false)
    }
  }

  const addToArray = (key: keyof UserPreferences, value: string) => {
    const currentValue = preferences[key]
    if (value.trim() && Array.isArray(currentValue) && !currentValue.includes(value.trim())) {
      setPreferences({
        ...preferences,
        [key]: [...currentValue, value.trim()],
      })
    }
  }

  const removeFromArray = (key: keyof UserPreferences, value: string) => {
    const currentValue = preferences[key]
    if (Array.isArray(currentValue)) {
      setPreferences({
        ...preferences,
        [key]: currentValue.filter((item) => item !== value),
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user?.name}!</h1>
            <p className="text-orange-100">Manage your preferences and view your food journey</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Heart />} label="Favorites" value={stats.favorites} />
        <StatCard icon={<Utensils />} label="Recipes" value={stats.recipes} />
        <StatCard icon={<Calendar />} label="Meals Planned" value={stats.meals} />
        <StatCard icon={<ShoppingCart />} label="Grocery Items" value={stats.groceries} />
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickLink href="/assistant" icon={<User />} label="AI Assistant" />
        <QuickLink href="/recipes" icon={<Utensils />} label="Recipes" />
        <QuickLink href="/planner" icon={<Calendar />} label="Meal Planner" />
        <QuickLink href="/grocery" icon={<ShoppingCart />} label="Grocery List" />
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          Your Preferences
        </h2>

        <div className="space-y-6">
          {/* Diet Preferences */}
          <PreferenceSection
            title="Diet Preferences"
            items={preferences.diet_preferences}
            onAdd={(value) => addToArray('diet_preferences', value)}
            onRemove={(value) => removeFromArray('diet_preferences', value)}
            placeholder="e.g., Vegetarian, Vegan, Keto"
          />

          {/* Allergies */}
          <PreferenceSection
            title="Allergies"
            items={preferences.allergies}
            onAdd={(value) => addToArray('allergies', value)}
            onRemove={(value) => removeFromArray('allergies', value)}
            placeholder="e.g., Nuts, Dairy, Gluten"
          />

          {/* Health Goals */}
          <PreferenceSection
            title="Health Goals"
            items={preferences.health_goals}
            onAdd={(value) => addToArray('health_goals', value)}
            onRemove={(value) => removeFromArray('health_goals', value)}
            placeholder="e.g., Weight Loss, Muscle Gain"
          />

          {/* Favorite Cuisines */}
          <PreferenceSection
            title="Favorite Cuisines"
            items={preferences.favorite_cuisines}
            onAdd={(value) => addToArray('favorite_cuisines', value)}
            onRemove={(value) => removeFromArray('favorite_cuisines', value)}
            placeholder="e.g., Ghanaian, Italian, Asian"
          />

          {/* AI Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred AI Assistant
            </label>
            <select
              value={preferences.ai_provider || 'openai'}
              onChange={(e) => setPreferences({ ...preferences, ai_provider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="openai">OpenAI (GPT-3.5/GPT-4)</option>
              <option value="gemini">Google Gemini (Free tier available)</option>
              <option value="claude">Anthropic Claude</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose your preferred AI for chat and recipe generation. Some providers may require API keys to be configured.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Notes
            </label>
            <textarea
              value={preferences.notes}
              onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add any notes about your food preferences, cooking style, or dietary needs..."
            />
          </div>
        </div>

        <button
          onClick={savePreferences}
          disabled={saving}
          className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="text-orange-500 mb-3">{icon}</div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-3 group"
    >
      <div className="text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="font-semibold text-gray-800">{label}</span>
    </a>
  )
}

function PreferenceSection({
  title,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="hover:text-orange-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
