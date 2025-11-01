import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

// Mark this route as dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await isAdmin()
    return NextResponse.json({ isAdmin: admin })
  } catch (error: any) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
