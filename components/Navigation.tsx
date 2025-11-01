'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, MessageSquare, Utensils, Calendar, ShoppingCart, ChefHat, Heart, User, LogOut, Shield } from 'lucide-react'
import Logo from './Logo'
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
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" showText={false} />
          </Link>
          <div className="flex gap-1 items-center flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white/50 hover:text-orange-500'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    pathname === '/dashboard'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white/50 hover:text-orange-500'
                  }`}
                  title="Dashboard"
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-medium hidden md:inline">Dashboard</span>
                </Link>
                <AdminLink />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:bg-white/50 hover:text-orange-500 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-xs font-medium hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-md"
                title="Sign In"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium hidden md:inline">Sign In</span>
              </Link>
            )}
          </div>
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
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
        pathname === '/admin'
          ? 'bg-purple-500 text-white shadow-md'
          : 'text-gray-600 hover:bg-white/50 hover:text-purple-500'
      }`}
      title="Admin"
    >
      <Shield className="w-5 h-5" />
      <span className="text-xs font-medium hidden md:inline">Admin</span>
    </Link>
  )
}
