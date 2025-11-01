import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { getDb } from './db'

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return false
    }

    const db = await getDb()
    const result = await db.query('SELECT role FROM users WHERE id = $1', [session.user.id])
    
    if (result.rows.length === 0) {
      return false
    }

    return result.rows[0].role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export async function getUserRole(userId: number): Promise<string> {
  try {
    const db = await getDb()
    const result = await db.query('SELECT role FROM users WHERE id = $1', [userId])
    
    if (result.rows.length === 0) {
      return 'user'
    }

    return result.rows[0].role || 'user'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}
