# Vercel Environment Variables Setup

## ✅ Required Environment Variables

Add these in your Vercel project settings:

### 1. OpenAI API Key
- **Name:** `OPENAI_API_KEY`
- **Value:** `your_openai_api_key_here`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 2. Neon Database URL
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_05hDfaBcvHEy@ep-long-cherry-ahx5mdqx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

## 📋 How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - Enter the **Name**
   - Enter the **Value**
   - Select all environments (Production, Preview, Development)
   - Click **Save**

## 🔄 After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

2. **Initialize Database:**
   - After redeployment, visit: `https://your-app.vercel.app/api/db/init`
   - You should see: `{"message":"Database initialized successfully"}`

## ✅ Verification

After setup, test your app:
- Visit your Vercel URL
- Try the AI Assistant - it should work now
- Test saving recipes/favorites - they'll be stored in Neon database

## 🔒 Security Note

- ✅ These environment variables are encrypted and secure in Vercel
- ✅ They're only accessible in your serverless functions
- ✅ Never commit these to Git (already in .gitignore)
