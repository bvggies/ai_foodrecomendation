/**
 * Seed script to create admin accounts and sample users
 * Run with: node scripts/seed-users.js
 */

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false,
})

async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...')

    // Admin users
    const adminUsers = [
      {
        email: 'admin@smartbite.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'superadmin@smartbite.com',
        password: 'SuperAdmin@123',
        name: 'Super Admin',
        role: 'admin',
      },
    ]

    // Sample regular users
    const regularUsers = [
      {
        email: 'john@example.com',
        password: 'User@123',
        name: 'John Doe',
        role: 'user',
      },
      {
        email: 'jane@example.com',
        password: 'User@123',
        name: 'Jane Smith',
        role: 'user',
      },
      {
        email: 'chef@example.com',
        password: 'Chef@123',
        name: 'Chef Master',
        role: 'user',
      },
      {
        email: 'foodie@example.com',
        password: 'Foodie@123',
        name: 'Food Lover',
        role: 'user',
      },
    ]

    const allUsers = [...adminUsers, ...regularUsers]

    for (const user of allUsers) {
      const passwordHash = await hashPassword(user.password)

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      )

      if (existingUser.rows.length > 0) {
        // Update existing user
        await pool.query(
          `UPDATE users 
           SET password_hash = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP 
           WHERE email = $4`,
          [passwordHash, user.name, user.role, user.email]
        )
        console.log(`✅ Updated: ${user.email} (${user.role})`)
      } else {
        // Create new user
        await pool.query(
          `INSERT INTO users (email, password_hash, name, role) 
           VALUES ($1, $2, $3, $4)`,
          [user.email, passwordHash, user.name, user.role]
        )
        console.log(`✅ Created: ${user.email} (${user.role})`)
      }
    }

    console.log('\n✨ User seeding completed!')
    console.log('\n📋 Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🔐 ADMIN ACCOUNTS:')
    adminUsers.forEach(user => {
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.role.toUpperCase()}\n`)
    })
    
    console.log('👤 SAMPLE USER ACCOUNTS:')
    regularUsers.forEach(user => {
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Name: ${user.name}\n`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the seed
seedUsers()
