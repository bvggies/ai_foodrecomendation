'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Users,
  Utensils,
  Heart,
  Calendar,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  BarChart3,
  Loader2,
  X,
  Search,
  Filter,
  Download,
  Settings,
  Activity,
  Eye,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Database,
  Zap,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalAdmins: number
  totalRecipes: number
  totalFavorites: number
  totalMeals: number
  totalGroceries: number
  activeUsersToday: number
  recipesToday: number
}

interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
}

interface Recipe {
  id: string
  name: string
  cuisine: string
  diet_type?: string
  created_at: string
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'recipes' | 'analytics' | 'settings'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', password: '' })
  
  // Enhanced features
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [recipeFilter, setRecipeFilter] = useState<'all' | string>('all')
  const [userPage, setUserPage] = useState(1)
  const [recipePage, setRecipePage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'role'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const itemsPerPage = 10

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      checkAdminStatus()
    }
  }, [status, session, router])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAdmin(data.isAdmin || false)

      if (!data.isAdmin) {
        router.push('/dashboard')
        return
      }

      loadData()
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes, recipesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?limit=100`),
        fetch(`/api/admin/recipes?limit=100`),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json()
        setRecipes(recipesData.recipes || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editForm,
          password: editForm.password || undefined,
        }),
      })

      if (response.ok) {
        await loadData()
        setEditingUser(null)
        setEditForm({ name: '', email: '', role: 'user', password: '' })
        alert('User updated successfully!')
      } else {
        alert('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadData()
        alert('User deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/recipes?recipeId=${recipeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadData()
        alert('Recipe deleted successfully!')
      } else {
        alert('Failed to delete recipe')
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Error deleting recipe')
    }
  }

  const exportData = async (type: 'users' | 'recipes') => {
    try {
      const data = type === 'users' ? users : recipes
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartbite-${type}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  // Filter and sort logic
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = userFilter === 'all' || user.role === userFilter
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'date') comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else if (sortBy === 'role') comparison = a.role.localeCompare(b.role)
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const filteredRecipes = recipes
    .filter(recipe => {
      const matchesSearch = !searchQuery || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = recipeFilter === 'all' || recipe.cuisine === recipeFilter
      return matchesSearch && matchesFilter
    })

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )

  const paginatedRecipes = filteredRecipes.slice(
    (recipePage - 1) * itemsPerPage,
    recipePage * itemsPerPage
  )

  const uniqueCuisines = Array.from(new Set(recipes.map(r => r.cuisine).filter(Boolean)))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10" />
                Admin Dashboard
              </h1>
              <p className="text-purple-100">Manage your SmartBite platform</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all backdrop-blur-sm"
              >
                User View
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2 border border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users, badge: stats?.totalUsers },
            { id: 'recipes', label: 'Recipes', icon: Utensils, badge: stats?.totalRecipes },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all rounded-lg relative ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white bg-opacity-30' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={<Users />} 
                label="Total Users" 
                value={stats.totalUsers} 
                color="blue" 
                trend={stats.activeUsersToday}
                trendLabel="active today"
              />
              <StatCard 
                icon={<Shield />} 
                label="Admins" 
                value={stats.totalAdmins || 0} 
                color="purple" 
              />
              <StatCard 
                icon={<Utensils />} 
                label="Recipes" 
                value={stats.totalRecipes} 
                color="green" 
                trend={stats.recipesToday}
                trendLabel="added today"
              />
              <StatCard 
                icon={<Heart />} 
                label="Favorites" 
                value={stats.totalFavorites} 
                color="red" 
              />
              <StatCard 
                icon={<Calendar />} 
                label="Meals Planned" 
                value={stats.totalMeals} 
                color="orange" 
              />
              <StatCard 
                icon={<ShoppingCart />} 
                label="Grocery Items" 
                value={stats.totalGroceries} 
                color="indigo" 
              />
              <StatCard 
                icon={<Zap />} 
                label="Active Today" 
                value={stats.activeUsersToday || 0} 
                color="yellow" 
              />
              <StatCard 
                icon={<Activity />} 
                label="New Recipes" 
                value={stats.recipesToday || 0} 
                color="teal" 
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => exportData('users')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                >
                  <Download className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-sm">Export Users</span>
                </button>
                <button
                  onClick={() => exportData('recipes')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                >
                  <Download className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-sm">Export Recipes</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                >
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-sm">View Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                >
                  <Settings className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-sm">System Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-blue-500" />
                    Recent Users
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-green-500" />
                    Top Recipes
                  </h3>
                  <button
                    onClick={() => setActiveTab('recipes')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {recipes.slice(0, 5).map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-semibold">{recipe.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          {recipe.cuisine && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                              {recipe.cuisine}
                            </span>
                          )}
                          {recipe.diet_type && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                              {recipe.diet_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage all users in the system</p>
                </div>
                <button
                  onClick={() => exportData('users')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="mt-4 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setUserPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value as any)
                    setUserPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any)
                    setUserPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="role">Sort by Role</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {Math.ceil(filteredUsers.length / itemsPerPage) > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold">
                    Page {userPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setUserPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                    disabled={userPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Recipe Management</h2>
                  <p className="text-gray-600 mt-1">Manage all recipes in the system</p>
                </div>
                <button
                  onClick={() => exportData('recipes')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="mt-4 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setRecipePage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <select
                  value={recipeFilter}
                  onChange={(e) => {
                    setRecipeFilter(e.target.value)
                    setRecipePage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Cuisines</option>
                  {uniqueCuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cuisine</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Diet Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No recipes found
                      </td>
                    </tr>
                  ) : (
                    paginatedRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{recipe.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {recipe.cuisine ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                              {recipe.cuisine}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {recipe.diet_type ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                              {recipe.diet_type}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(recipe.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete recipe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {Math.ceil(filteredRecipes.length / itemsPerPage) > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(recipePage - 1) * itemsPerPage + 1} to {Math.min(recipePage * itemsPerPage, filteredRecipes.length)} of {filteredRecipes.length} recipes
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecipePage(p => Math.max(1, p - 1))}
                    disabled={recipePage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold">
                    Page {recipePage} of {Math.ceil(filteredRecipes.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setRecipePage(p => Math.min(Math.ceil(filteredRecipes.length / itemsPerPage), p + 1))}
                    disabled={recipePage >= Math.ceil(filteredRecipes.length / itemsPerPage)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <EnhancedAnalyticsView />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-500" />
              System Settings
            </h2>
            <div className="space-y-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Database Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Database className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="font-semibold">PostgreSQL</div>
                      <div className="text-sm text-gray-600">Connected</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-semibold">Total Records</div>
                      <div className="text-sm text-gray-600">
                        {stats ? (
                          stats.totalUsers + stats.totalRecipes + stats.totalFavorites + stats.totalMeals + stats.totalGroceries
                        ) : 0} entries
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Platform Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">System Operational</span>
                    </div>
                    <span className="text-green-600 text-sm">All systems normal</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">AI Provider</span>
                    </div>
                    <span className="text-blue-600 text-sm">Groq Turbo Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit User</h2>
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave empty to keep current password"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  trend, 
  trendLabel 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: string
  trend?: number
  trendLabel?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500',
    teal: 'bg-teal-500',
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`${colorClasses[color as keyof typeof colorClasses]} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      {trend !== undefined && trendLabel && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend} {trendLabel}
        </div>
      )}
    </div>
  )
}

function EnhancedAnalyticsView() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetch(`/api/admin/analytics?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading analytics:', err)
        setLoading(false)
      })
  }, [period])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
        <p className="text-gray-600 mt-2">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No analytics data available</p>
      </div>
    )
  }

  const maxCount = Math.max(
    ...(analytics.userGrowth?.map((u: any) => parseInt(u.count)) || [0]),
    ...(analytics.recipeActivity?.map((r: any) => parseInt(r.count)) || [0])
  )

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            Analytics Overview
          </h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-semibold mb-4">User Growth</h4>
            <div className="space-y-2">
              {analytics.userGrowth?.slice(-10).map((item: any, idx: number) => {
                const percentage = maxCount > 0 ? (parseInt(item.count) / maxCount) * 100 : 0
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">{item.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {item.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recipe Activity</h4>
            <div className="space-y-2">
              {analytics.recipeActivity?.slice(-10).map((item: any, idx: number) => {
                const percentage = maxCount > 0 ? (parseInt(item.count) / maxCount) * 100 : 0
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">{item.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {item.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Favorite Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Unique Users:</span>
              <span className="font-bold text-lg">{analytics.favoriteStats?.unique_users || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Favorites:</span>
              <span className="font-bold text-lg">{analytics.favoriteStats?.total_favorites || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Unique Recipes:</span>
              <span className="font-bold text-lg">{analytics.favoriteStats?.unique_recipes || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-500" />
            Meal Planner Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Users:</span>
              <span className="font-bold text-lg">{analytics.mealPlannerStats?.active_users || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Meals:</span>
              <span className="font-bold text-lg">{analytics.mealPlannerStats?.total_meals || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Unique Dates:</span>
              <span className="font-bold text-lg">{analytics.mealPlannerStats?.unique_dates || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-green-500" />
          Cuisine Distribution
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.cuisineDistribution?.map((item: any, idx: number) => {
            const totalRecipes = analytics.cuisineDistribution.reduce((sum: number, c: any) => sum + parseInt(c.count), 0)
            const percentage = totalRecipes > 0 ? (parseInt(item.count) / totalRecipes) * 100 : 0
            return (
              <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{item.cuisine}</span>
                  <span className="text-sm font-bold text-purple-600">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of recipes</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}