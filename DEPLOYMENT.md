# Deployment Guide

This guide will help you deploy the AI Food Assistant app to GitHub, Vercel, and set up PostgreSQL.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres, Supabase, or Neon recommended)

## 🚀 Step 1: Push to GitHub

### 1.1 Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: AI Food Assistant app"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Don't initialize with README, .gitignore, or license
3. Copy the repository URL

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🗄️ Step 2: Set Up PostgreSQL Database

You have several options:

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Select a region close to you
4. Create the database
5. Copy the connection string (it will be auto-added to environment variables)

### Option B: Supabase (Free tier available)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Option C: Neon (Serverless Postgres)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to [Vercel](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables

In Vercel project settings, add:

- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key

- **Name:** `DATABASE_URL`
- **Value:** Your PostgreSQL connection string

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

### 3.4 Initialize Database

After deployment, visit:
```
https://your-project.vercel.app/api/db/init
```

This will create all necessary database tables.

## 🔧 Step 4: Local Development with Database

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Set Up Environment Variables

Create `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_postgresql_connection_string_here
```

### 4.3 Run Database Migration

```bash
npm run dev
```

Then visit: `http://localhost:3000/api/db/init`

### 4.4 Start Development Server

```bash
npm run dev
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes (for production) |

## 🗄️ Database Schema

The app uses the following tables:

- **recipes** - Generated and saved recipes
- **favorites** - User favorite recipes
- **grocery_items** - Shopping list items
- **meals** - Meal planner entries

## 🔄 Updating the Deployment

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. Vercel will automatically redeploy

## 🐛 Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For Vercel Postgres, connections are automatically allowed

### Build Failures

- Check Vercel build logs
- Ensure all environment variables are set
- Verify Node.js version compatibility

### API Errors

- Check that OpenAI API key is valid
- Verify database is initialized
- Check Vercel function logs

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 You're Done!

Your app should now be live and accessible. The database will persist data across deployments.
