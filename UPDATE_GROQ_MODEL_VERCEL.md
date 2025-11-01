# How to Update Groq Model in Vercel

You're getting this error because your Vercel environment variable still has the old deprecated model.

## Quick Fix:

### Option 1: Update the Environment Variable (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `ai_foodrecomendation`

2. **Navigate to Environment Variables**
   - Go to: **Settings** → **Environment Variables**

3. **Update GROQ_MODEL**
   - Find the variable: `GROQ_MODEL`
   - Click on it to edit
   - Change the value from:
     ```
     llama-3.1-70b-versatile
     ```
     to:
     ```
     llama-3.3-70b-versatile
     ```
   - Click **Save**

4. **Redeploy**
   - Vercel will automatically trigger a new deployment
   - Wait for it to complete (1-2 minutes)

### Option 2: Delete the Variable (Uses Default)

1. **Go to Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Find `GROQ_MODEL`**
3. **Click the trash icon** to delete it
4. The app will use the new default: `llama-3.3-70b-versatile`
5. **Redeploy** (automatic)

## Verify It's Fixed:

After deployment completes:
1. Go to your app
2. Try using Groq Turbo in the AI Assistant
3. The error should be gone! ✅

## Why This Happened:

- The code was updated to use `llama-3.3-70b-versatile` by default
- But if you had `GROQ_MODEL` set in Vercel with the old value, it overrides the code default
- Environment variables take precedence over code defaults

## Current Status:

- ✅ Code default: `llama-3.3-70b-versatile` (correct)
- ⚠️ Vercel env var: Still has old value (needs update)
- 🎯 After update: Everything will work!

---

**After updating, Groq Turbo will work perfectly!** 🚀
