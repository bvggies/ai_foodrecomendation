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

  // Neon and other cloud databases require SSL
  const requiresSSL = connectionString.includes('sslmode=require') || 
                      connectionString.includes('neon.tech') ||
                      process.env.NODE_ENV === 'production'

  const pool = new Pool({
    connectionString,
    ssl: requiresSSL ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
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
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Update existing users to have 'user' role if column doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `)

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

    // Favorites table
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        recipe_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
        completed BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add completed column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        ALTER TABLE meals ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `)

    // User preferences/important data table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        diet_preferences TEXT[],
        allergies TEXT[],
        health_goals TEXT[],
        favorite_cuisines TEXT[],
              ai_provider VARCHAR(20) DEFAULT 'groq',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add ai_provider column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'groq';
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `)

    // User logins table (track login IPs and sessions)
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_logins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT TRUE
      )
    `)

    // User activities table (track user actions)
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // User inputs table (track search queries and chat inputs for analytics)
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_inputs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        input_type VARCHAR(50) NOT NULL,
        input_text TEXT,
        context JSONB,
        ip_address VARCHAR(45),
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
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_logins_user ON user_logins(user_id)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_logins_ip ON user_logins(ip_address)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_inputs_user ON user_inputs(user_id)
    `)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_inputs_type ON user_inputs(input_type)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
