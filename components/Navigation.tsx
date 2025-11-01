'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, MessageSquare, Utensils, Calendar, ShoppingCart, ChefHat, Heart, User, LogOut, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/assistant', label: 'AI Assistant', icon: MessageSquare },
    { href: '/recipes', label: 'Recipes', icon: Utensils },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/planner', label: 'Meal Planner', icon: Calendar },
    { href: '/grocery', label: 'Grocery List', icon: ShoppingCart },
    { href: '/recommendations', label: 'Recommendations', icon: ChefHat },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-[95%] md:max-w-6xl">
      <div className="bg-white/95 backdrop-blur-lg rounded-t-2xl md:rounded-2xl shadow-xl border-t md:border border-gray-200 md:border-white/20 px-2 md:px-4 py-2 md:py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-2 rounded-xl transition-all min-w-[44px] min-h-[44px] justify-center touch-manipulation ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 active:bg-white/50 active:text-orange-500'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-xs font-medium hidden lg:inline">{item.label}</span>
                </Link>
              )
            })}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-2 rounded-xl transition-all min-w-[44px] min-h-[44px] justify-center touch-manipulation ${
                    pathname === '/dashboard'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 active:bg-white/50 active:text-orange-500'
                  }`}
                  title="Dashboard"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] md:text-xs font-medium hidden lg:inline">Dashboard</span>
                </Link>
                <AdminLink />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-2 rounded-xl text-gray-600 active:bg-white/50 active:text-orange-500 transition-all min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] md:text-xs font-medium hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-2 rounded-xl bg-orange-500 text-white active:bg-orange-600 transition-all shadow-md min-w-[44px] min-h-[44px] justify-center touch-manipulation"
                title="Sign In"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] md:text-xs font-medium hidden lg:inline">Sign In</span>
              </Link>
            )}
        </div>
      </div>
    </nav>
  )
}

function AdminLink() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/admin/check')
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin || false))
        .catch(() => setIsAdmin(false))
    }
  }, [session])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className={`flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-2 rounded-xl transition-all min-w-[44px] min-h-[44px] justify-center touch-manipulation ${
        pathname === '/admin'
          ? 'bg-purple-500 text-white shadow-md'
          : 'text-gray-600 active:bg-white/50 active:text-purple-500'
      }`}
      title="Admin"
    >
      <Shield className="w-5 h-5" />
      <span className="text-[10px] md:text-xs font-medium hidden lg:inline">Admin</span>
    </Link>
  )
}
