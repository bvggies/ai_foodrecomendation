/**
 * Utility functions for tracking user activities and inputs
 */

import { getDb } from './db'

export type ActivityType = 
  | 'chat_message'
  | 'recipe_generated'
  | 'recipe_viewed'
  | 'recipe_favorited'
  | 'meal_planned'
  | 'grocery_added'
  | 'recommendation_requested'
  | 'search_performed'
  | 'page_visited'

export type InputType = 
  | 'chat'
  | 'recipe_search'
  | 'recommendation'
  | 'grocery_search'

interface TrackActivityParams {
  userId?: number | string | null
  activityType: ActivityType
  activityData?: Record<string, any>
  ipAddress?: string
}

interface TrackInputParams {
  userId?: number | string | null
  inputType: InputType
  inputText: string
  context?: Record<string, any>
  ipAddress?: string
}

/**
 * Track a user activity
 */
export async function trackActivity({
  userId,
  activityType,
  activityData,
  ipAddress,
}: TrackActivityParams) {
  try {
    const db = await getDb()
    await db.query(
      `INSERT INTO user_activities (user_id, activity_type, activity_data, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        userId ? parseInt(String(userId)) : null,
        activityType,
        activityData ? JSON.stringify(activityData) : null,
        ipAddress || null,
      ]
    )
  } catch (error) {
    console.error('Error tracking activity:', error)
    // Don't throw - tracking shouldn't break the app
  }
}

/**
 * Track user input for analytics
 */
export async function trackInput({
  userId,
  inputType,
  inputText,
  context,
  ipAddress,
}: TrackInputParams) {
  try {
    const db = await getDb()
    // Only track non-empty inputs
    if (!inputText || inputText.trim().length === 0) {
      return
    }
    
    await db.query(
      `INSERT INTO user_inputs (user_id, input_type, input_text, context, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId ? parseInt(String(userId)) : null,
        inputType,
        inputText.substring(0, 500), // Limit length
        context ? JSON.stringify(context) : null,
        ipAddress || null,
      ]
    )
  } catch (error) {
    console.error('Error tracking input:', error)
    // Don't throw - tracking shouldn't break the app
  }
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(req: any): string {
  const forwarded = req?.headers?.['x-forwarded-for']
  const realIp = req?.headers?.['x-real-ip']
  
  if (forwarded) {
    return String(forwarded).split(',')[0].trim()
  }
  if (realIp) {
    return String(realIp)
  }
  return 'unknown'
}
