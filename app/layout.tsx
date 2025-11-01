import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartBite – AI helping you pick the right bite',
  description: 'AI-powered food recommendations, recipe generation, and meal planning. Discover meals, plan diets, and cook efficiently with personalized AI-powered recommendations.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navigation />
          <main className="min-h-screen pb-20 md:pb-24 safe-area-inset-bottom">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
