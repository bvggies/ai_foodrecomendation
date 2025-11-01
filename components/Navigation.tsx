'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, Utensils, Calendar, ShoppingCart, ChefHat, Heart } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-orange-500">
            <ChefHat className="w-6 h-6" />
            <span>FoodAI</span>
          </Link>
          <div className="flex gap-1">
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
          </div>
        </div>
      </div>
    </nav>
  )
}
