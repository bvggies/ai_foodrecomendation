// Database adapter that works with both Vercel Postgres and regular pg
let dbAdapter: any = null

async function initDbAdapter() {
  if (dbAdapter) return dbAdapter

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Try to use regular pg (works with both Vercel Postgres and external PostgreSQL)
  const { Pool } = await import('pg')
  const connectionString = process.env.DATABASE_URL

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  dbAdapter = {
    query: (text: string, params?: any[]) => pool.query(text, params),
    end: () => pool.end(),
  }

  return dbAdapter
}

export async function getDb() {
  return await initDbAdapter()
}

// Initialize database tables
export async function initDb() {
  const db = await getDb()

  try {
    // Recipes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER,
        calories INTEGER,
        ingredients TEXT[],
        instructions TEXT[],
        nutrition JSONB,
        image VARCHAR(10),
        diet_type VARCHAR(50),
        cuisine VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Favorites table (user_id can be extended for multi-user support)
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        recipe_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(recipe_id, user_id)
      )
    `)

    // Grocery items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        quantity TEXT,
        category VARCHAR(50) NOT NULL,
        bought BOOLEAN DEFAULT FALSE,
        user_id VARCHAR(255) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Meal planner table
    await db.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id VARCHAR(255) PRIMARY KEY,
        date DATE NOT NULL,
        name TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        time VARCHAR(10),
        user_id VARCHAR(255) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_grocery_user ON grocery_items(user_id)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
