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
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo size="md" showText={true} />
          </Link>
          <div className="flex gap-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <AdminLink />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        pathname === '/admin'
          ? 'bg-purple-500 text-white'
          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-500'
      }`}
    >
      <Shield className="w-4 h-4" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  )
}
