'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Check, X, Trash2 } from 'lucide-react'

interface GroceryItem {
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

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([])

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('groceryItems')
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems))
      } catch (e) {
        console.error('Error loading grocery items:', e)
      }
    } else {
      // Default items for first-time users
      setItems([
        { id: '1', name: 'Chicken Breast', quantity: '500g', category: 'Meat & Seafood', bought: false },
        { id: '2', name: 'Tomatoes', quantity: '4 pieces', category: 'Produce', bought: false },
        { id: '3', name: 'Rice', quantity: '1 kg', category: 'Pantry', bought: false },
      ])
    }

    // Listen for storage events (when items are added from other pages)
    const handleStorageChange = () => {
      const savedItems = localStorage.getItem('groceryItems')
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems))
        } catch (e) {
          console.error('Error loading grocery items:', e)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'Other' })

  const saveItems = (newItems: GroceryItem[]) => {
    setItems(newItems)
    localStorage.setItem('groceryItems', JSON.stringify(newItems))
  }

  const addItem = () => {
    if (!newItem.name.trim()) return

    const updatedItems = [
      ...items,
      {
        id: Date.now().toString(),
        name: newItem.name,
        quantity: newItem.quantity || '1',
        category: newItem.category,
        bought: false,
      },
    ]
    saveItems(updatedItems)
    setNewItem({ name: '', quantity: '', category: 'Other' })
    setShowAddModal(false)
  }

  const toggleBought = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, bought: !item.bought } : item
    )
    saveItems(updatedItems)
  }

  const deleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    saveItems(updatedItems)
  }

  const clearBought = () => {
    const updatedItems = items.filter((item) => !item.bought)
    saveItems(updatedItems)
  }

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter((item) => item.category === category)
    return acc
  }, {} as Record<string, GroceryItem[]>)

  const boughtCount = items.filter((item) => item.bought).length
  const totalCount = items.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Grocery List</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Shopping Progress</span>
              <span className="text-orange-600 font-bold">
                {boughtCount} / {totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${(boughtCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {boughtCount > 0 && (
          <button
            onClick={clearBought}
            className="text-sm text-orange-500 hover:text-orange-600 font-semibold mb-4"
          >
            Clear bought items
          </button>
        )}
      </div>

      {/* Grocery List by Category */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your list is empty</h2>
          <p className="text-gray-500 mb-6">Add items to get started with your grocery shopping</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(
            (category) =>
              groupedItems[category] && groupedItems[category].length > 0 && (
                <div key={category} className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">{category}</h2>
                  <div className="space-y-2">
                    {groupedItems[category].map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${
                          item.bought
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-white border-orange-100'
                        }`}
                      >
                        <button
                          onClick={() => toggleBought(item.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.bought
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.bought && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div
                            className={`font-medium ${
                              item.bought ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {item.name}
                          </div>
                          {item.quantity && (
                            <div className="text-sm text-gray-500">{item.quantity}</div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Grocery Item</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Milk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem()
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (Optional)
                </label>
                <input
                  type="text"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="e.g., 1 liter, 500g, 2 pieces"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem()
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                onClick={addItem}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
