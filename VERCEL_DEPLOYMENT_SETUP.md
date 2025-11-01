# Vercel Deployment Setup Guide

This guide will help you set up admin accounts and fix login issues on your Vercel deployment.

## 🚀 Quick Fix: Seed Admin Accounts

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

   ```
   SEED_SECRET = your-super-secret-key-here
   DATABASE_URL = your_neon_database_connection_string
   OPENAI_API_KEY = your_openai_api_key
   NEXTAUTH_SECRET = generate_with_openssl_rand_base64_32
   NEXTAUTH_URL = https://your-app.vercel.app
   ```

   **Generate a secure SEED_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

### Step 2: Seed the Database

**Option A: Using the API Endpoint (Recommended)**

1. After deploying, visit this URL in your browser:
   ```
   https://your-app.vercel.app/api/admin/seed-production?secret=your-super-secret-key-here
   ```

2. Or use curl:
   ```bash
   curl -X POST "https://your-app.vercel.app/api/admin/seed-production?secret=your-super-secret-key-here"
   ```

3. You should see a success response with all created accounts.

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables
vercel env pull .env.production

# Run seed script locally (will connect to production DB)
node scripts/seed-users.js
```

**Option C: Direct SQL (If you have database access)**

Connect to your Neon PostgreSQL database and run:

```sql
-- You'll need to hash passwords first using bcrypt
-- Or use the API endpoint method above which handles it automatically
```

### Step 3: Initialize Database Tables

Make sure your database tables are created:

1. Visit: `https://your-app.vercel.app/api/db/init`
2. Or deploy after running the init route at least once

## 🔐 Login Credentials

After seeding, use these credentials:

**Admin:**
- Email: `admin@smartbite.com`
- Password: `Admin@123`

**Super Admin:**
- Email: `superadmin@smartbite.com`
- Password: `SuperAdmin@123`

## 🔧 Troubleshooting

### Issue: "Invalid email or password"

**Solutions:**
1. ✅ **Check if accounts exist:**
   - The accounts might not have been seeded yet
   - Run the seed endpoint (see Step 2 above)

2. ✅ **Verify database connection:**
   - Check that `DATABASE_URL` is set correctly in Vercel
   - Test connection by visiting `/api/db/init`

3. ✅ **Check NEXTAUTH_SECRET:**
   - Make sure `NEXTAUTH_SECRET` is set in Vercel
   - It should be a long random string

4. ✅ **Verify environment variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure all required vars are set for Production

### Issue: "Database connection error"

**Solutions:**
1. Check your `DATABASE_URL` format:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

2. For Neon, ensure `sslmode=require` is in the connection string

3. Verify database is accessible from Vercel's IP ranges

### Issue: Seed endpoint returns 403

**Solutions:**
1. Make sure `SEED_SECRET` is set in Vercel environment variables
2. Use the exact same secret in the URL query parameter
3. Redeploy after adding environment variables (they only take effect after redeploy)

### Issue: Session not working

**Solutions:**
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your deployment URL
3. Clear browser cookies and try again
4. Check browser console for errors

## 📋 Checklist Before Deployment

- [ ] `DATABASE_URL` is set in Vercel
- [ ] `OPENAI_API_KEY` is set in Vercel
- [ ] `NEXTAUTH_SECRET` is set in Vercel (generate with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` is set to your Vercel deployment URL
- [ ] `SEED_SECRET` is set (for seeding accounts)
- [ ] Database tables are initialized (`/api/db/init`)
- [ ] Admin accounts are seeded (`/api/admin/seed-production?secret=...`)

## 🎯 Post-Deployment Steps

1. **Initialize Database:**
   ```
   Visit: https://your-app.vercel.app/api/db/init
   ```

2. **Seed Admin Accounts:**
   ```
   Visit: https://your-app.vercel.app/api/admin/seed-production?secret=YOUR_SECRET
   ```

3. **Test Login:**
   - Go to `/login`
   - Use `superadmin@smartbite.com` / `SuperAdmin@123`
   - Verify you can access `/admin` dashboard

4. **Remove/Protect Seed Endpoint (Optional):**
   - Consider removing `SEED_SECRET` after seeding
   - Or keep it for future account creation

## 🔒 Security Notes

- **Never commit secrets** to git
- **Rotate secrets** if they're exposed
- **Remove seed endpoint** or protect it after initial setup
- **Change default passwords** in production
- **Use strong secrets** (at least 32 characters)

## 📞 Need Help?

If login still doesn't work after following these steps:

1. Check Vercel function logs for errors
2. Verify all environment variables are set correctly
3. Test database connection separately
4. Check that database tables exist and have correct schema

## 🚀 Quick Deploy Command

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add OPENAI_API_KEY
vercel env add SEED_SECRET

# Redeploy to apply env vars
vercel --prod
```
