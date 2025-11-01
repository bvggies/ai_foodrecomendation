import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    )
  }
}
