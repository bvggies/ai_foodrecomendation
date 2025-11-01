import Link from 'next/link'
import { ChefHat, Sparkles, Calendar, ShoppingCart, Utensils } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} />
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover meals, plan diets, and cook efficiently with personalized AI-powered recommendations
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/assistant"
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg"
          >
            Start Chatting
          </Link>
          <Link
            href="/recipes"
            className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Browse Recipes
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={<Sparkles className="w-8 h-8" />}
          title="SmartBite AI Assistant"
          description="Chat with AI to get recipe recommendations, cooking tips, and meal ideas based on your preferences."
          link="/assistant"
        />
        <FeatureCard
          icon={<Utensils className="w-8 h-8" />}
          title="Recipe Generator"
          description="Generate step-by-step recipes from ingredients you have. Includes prep time, cook time, and nutritional info."
          link="/recipes/generator"
        />
        <FeatureCard
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Smart Grocery List"
          description="Automatically generate shopping lists from selected recipes. Mark items as bought and stay organized."
          link="/grocery"
        />
        <FeatureCard
          icon={<Calendar className="w-8 h-8" />}
          title="Meal Planner"
          description="Plan your meals for the week or month. Drag and drop recipes into calendar slots with reminders."
          link="/planner"
        />
        <FeatureCard
          icon={<ChefHat className="w-8 h-8" />}
          title="Personalized Recommendations"
          description="Get recipe suggestions based on your diet preferences, health goals, and past favorites."
          link="/recommendations"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">1000+</div>
            <div className="text-gray-600">Recipes Available</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">AI-Powered</div>
            <div className="text-gray-600">Recipe Generation</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">Free</div>
            <div className="text-gray-600">To Get Started</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, link }: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}) {
  return (
    <Link href={link}>
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 h-full">
        <div className="text-orange-500 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
