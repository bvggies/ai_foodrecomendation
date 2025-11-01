# Quick Admin Setup Guide

If you're getting "Invalid email or password" when trying to log in with the admin credentials, the accounts haven't been created yet. Here are 3 easy ways to create them:

## Method 1: API Endpoint (Easiest) ⚡

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/api/admin/seed
   ```
   
   OR use curl/Postman to POST to this endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

   In development mode, it will work without a secret. In production, you can set `SEED_SECRET` environment variable.

3. This will create all admin and user accounts instantly!

## Method 2: Direct SQL (Fast) 🗄️

Connect to your PostgreSQL database and run:

```sql
-- First, you need to hash the password. Use this Node.js one-liner or the API:
-- node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('SuperAdmin@123',10).then(h=>console.log(h))"

-- For now, create a temporary script or use the API method above.
-- Or manually create just one admin:

-- Example (you need to replace PASSWORD_HASH with actual bcrypt hash):
INSERT INTO users (email, password_hash, name, role) 
VALUES ('superadmin@smartbite.com', '$2a$10$REPLACE_WITH_HASHED_PASSWORD', 'Super Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  name = 'Super Admin',
  updated_at = CURRENT_TIMESTAMP;
```

## Method 3: Sign Up + Manual Admin Assignment 👤

1. Go to `/login` and click "Sign up"
2. Create an account with email: `superadmin@smartbite.com` and password: `SuperAdmin@123`
3. Connect to your database and run:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'superadmin@smartbite.com';
   ```
4. Now log in - you'll have admin access!

## Recommended: Use Method 1 (API Endpoint)

The API endpoint is the easiest and handles password hashing automatically. Just visit the URL in your browser or use curl, and all accounts will be created.

## After Seeding

Once the accounts are created, you can log in with:

**Admin:**
- Email: `admin@smartbite.com`
- Password: `Admin@123`

**Super Admin:**
- Email: `superadmin@smartbite.com`  
- Password: `SuperAdmin@123`

**Test Users:**
- Email: `john@example.com`
- Password: `User@123`

## Troubleshooting

- **Still getting "Invalid email or password"?**
  - Make sure the seed endpoint ran successfully
  - Check your database connection
  - Verify the users table exists (run `/api/db/init` first if needed)

- **Can't access `/api/admin/seed`?**
  - Make sure your dev server is running
  - Check that you're in development mode
  - Try using curl/Postman instead of browser

## Security Note

The seed endpoint is only accessible in development mode by default. For production, set a `SEED_SECRET` environment variable and include it in your POST request:
```json
{ "secret": "your-secret-key" }
```
