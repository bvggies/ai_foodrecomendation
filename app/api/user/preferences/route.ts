import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const result = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        preferences: {
          diet_preferences: [],
          allergies: [],
          health_goals: [],
          favorite_cuisines: [],
          ai_provider: 'gemini',
          notes: '',
        },
      })
    }

    return NextResponse.json({ preferences: result.rows[0] })
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await req.json()
    const db = await getDb()

    await db.query(
      `INSERT INTO user_preferences (user_id, diet_preferences, allergies, health_goals, favorite_cuisines, ai_provider, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
       diet_preferences = EXCLUDED.diet_preferences,
       allergies = EXCLUDED.allergies,
       health_goals = EXCLUDED.health_goals,
       favorite_cuisines = EXCLUDED.favorite_cuisines,
       ai_provider = EXCLUDED.ai_provider,
       notes = EXCLUDED.notes,
       updated_at = CURRENT_TIMESTAMP`,
      [
        session.user.id,
        preferences.diet_preferences || [],
        preferences.allergies || [],
        preferences.health_goals || [],
        preferences.favorite_cuisines || [],
        preferences.ai_provider || 'gemini',
        preferences.notes || '',
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
