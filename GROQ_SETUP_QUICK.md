# Quick Setup: Groq Turbo (Free AI Provider)

## Get Your Free Groq API Key

1. **Sign up for Groq** (Free - No credit card required):
   - Visit: https://console.groq.com/
   - Click "Sign Up" or "Get Started"
   - Create an account (you can use Google account)

2. **Create API Key**:
   - Once logged in, go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Copy the API key (starts with `gsk_...`)

## Add to Vercel (Production)

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `ai_foodrecomendation`
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**
5. Add these variables:

   **Variable 1:**
   ```
   Name: GROQ_API_KEY
   Value: your_groq_api_key_here (paste your actual key)
   Environments: Production, Preview, Development (select all)
   ```

   **Variable 2 (Optional - has default):**
   ```
   Name: GROQ_MODEL
   Value: llama-3.1-70b-versatile
   Environments: Production, Preview, Development (select all)
   ```

6. Click **Save**
7. **Redeploy** your app (or wait for automatic redeployment)

## Add to Local Development (Optional)

Add to your `.env.local` file:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile
```

Then restart your dev server.

## Verify It's Working

1. After redeployment, go to your app
2. Navigate to **AI Assistant** page (`/assistant`)
3. Click the **AI Provider selector** (Sparkles icon in header)
4. You should see **"Groq Turbo"** marked as available with a **FREE** badge

## Free Tier Limits

- ✅ **14,400 requests per day** (very generous!)
- ✅ **Ultra-fast inference** (often faster than other providers)
- ✅ **No credit card required**
- ✅ **High-quality models** (Llama 3.1)

## Troubleshooting

**If Groq still shows as "not configured":**
1. Make sure you added `GROQ_API_KEY` to Vercel (not just locally)
2. Redeploy your app after adding the variable
3. Check that the API key starts with `gsk_`
4. Verify the key is active in Groq console

**If you get rate limit errors:**
- You've used your daily 14,400 requests
- Wait until the next day or try another provider (Gemini, ChatGPT, Claude)

---

**Once set up, users will see Groq Turbo as an available option alongside Gemini Spark! 🚀**
