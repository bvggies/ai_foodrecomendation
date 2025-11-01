# Quick Start Guide - GitHub, Vercel & PostgreSQL

## 🎯 Complete Setup in 5 Steps

### Step 1: Push to GitHub

```bash
git commit -m "Initial commit: AI Food Assistant with PostgreSQL support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Don't have a GitHub repo yet?**
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL and use it in the command above

---

### Step 2: Create PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
1. Deploy to Vercel first (Step 3)
2. In your Vercel project → **Storage** → **Create Database** → **Postgres**
3. Vercel will automatically add `POSTGRES_URL` to your environment variables

**Option B: Supabase (Free tier)**
1. Go to https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

**Option C: Neon (Serverless Postgres)**
1. Go to https://neon.tech
2. Create a project
3. Copy the connection string

---

### Step 3: Deploy to Vercel

1. **Import your GitHub repository:**
   - Go to https://vercel.com
   - Click **Add New Project**
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

2. **Add Environment Variables:**
   - `OPENAI_API_KEY` = Your OpenAI API key
   - `DATABASE_URL` = Your PostgreSQL connection string (or `POSTGRES_URL` if using Vercel Postgres)

3. **Deploy:**
   - Click **Deploy**
   - Wait for build to complete (~2-3 minutes)

---

### Step 4: Initialize Database

After deployment, visit:
```
https://your-project.vercel.app/api/db/init
```

This creates all necessary tables in your database.

**Note:** For Vercel Postgres, use `POSTGRES_URL` instead of `DATABASE_URL` in environment variables.

---

### Step 5: Test Your App

Visit: `https://your-project.vercel.app`

✅ Everything should work now!

---

## 🔧 Local Development with Database

If you want to test locally with PostgreSQL:

1. **Set up `.env.local`:**
```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_postgresql_connection_string
```

2. **Initialize database:**
```bash
npm run dev
```
Then visit: `http://localhost:3000/api/db/init`

3. **Start development:**
```bash
npm run dev
```

---

## 📝 Important Notes

- **Local Development:** The app currently uses localStorage when `DATABASE_URL` is not set
- **Production:** The app will use PostgreSQL when `DATABASE_URL` is available
- **Vercel Postgres:** Automatically provides `POSTGRES_URL` environment variable

---

## 🐛 Troubleshooting

**Database connection errors?**
- Check that `DATABASE_URL` is correctly set in Vercel
- Verify the connection string format
- Make sure database is accessible (not IP-restricted)

**Build fails?**
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Node.js version (should be 18+)

**API errors?**
- Visit `/api/db/init` to initialize database
- Check Vercel function logs
- Verify OpenAI API key is valid

---

## 🎉 You're All Set!

Your app is now:
- ✅ On GitHub
- ✅ Deployed to Vercel
- ✅ Connected to PostgreSQL
- ✅ Ready for production use!
