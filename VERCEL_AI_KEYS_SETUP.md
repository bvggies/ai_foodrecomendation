# Adding AI API Keys to Vercel

Your Gemini and Claude API keys have been added to your local `.env.local` file. To use them in production on Vercel, add them to your Vercel environment variables.

## Steps to Add API Keys to Vercel:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `ai_foodrecomendation`

2. **Navigate to Settings → Environment Variables**

3. **Add the following environment variables:**

### Google Gemini API Key (FREE tier)
```
Variable Name: GEMINI_API_KEY
Value: your_gemini_api_key_here
Environment: Production, Preview, Development (select all)
```

```
Variable Name: GEMINI_MODEL
Value: gemini-pro
Environment: Production, Preview, Development (select all)
```

### Anthropic Claude API Key
```
Variable Name: CLAUDE_API_KEY
Value: your_claude_api_key_here
Environment: Production, Preview, Development (select all)
```

```
Variable Name: CLAUDE_MODEL
Value: claude-3-haiku-20240307
Environment: Production, Preview, Development (select all)
```

4. **After Adding Variables:**
   - Click "Save" for each variable
   - Vercel will automatically redeploy your application with the new environment variables

5. **Verify in Your App:**
   - Go to your deployed app
   - Navigate to the AI Assistant page (`/assistant`)
   - Click the AI Provider selector (Sparkles icon)
   - You should now see:
     - ✅ **Google Gemini** - Available (marked as FREE)
     - ✅ **Anthropic Claude** - Available
     - ✅ **OpenAI** - Available (if you already have OPENAI_API_KEY set)

## Testing the Providers:

1. **Test Gemini (Free):**
   - Select "Google Gemini" from the provider dropdown
   - Ask a question like "What's a good Ghanaian recipe with plantains?"
   - Response should be powered by Gemini

2. **Test Claude:**
   - Select "Anthropic Claude" from the provider dropdown
   - Ask the same question
   - Response should be powered by Claude

3. **Compare Responses:**
   - Try the same question with different providers
   - Each AI may provide slightly different responses

## Free Tier Limits:

- **Gemini**: 60 requests per minute (free tier)
- **Claude**: Check your Anthropic account for rate limits
- **OpenAI**: Based on your subscription plan

## Security Notes:

⚠️ **Important**: 
- These API keys are sensitive credentials
- Never commit them to Git (they're already in `.gitignore`)
- Keep them secure
- If you suspect a key is compromised, regenerate it immediately from the respective provider's dashboard

## Troubleshooting:

If a provider doesn't appear as available:
1. Check that the environment variable is set correctly in Vercel
2. Ensure you've selected all environments (Production, Preview, Development)
3. Redeploy your application after adding the variables
4. Check the Vercel deployment logs for any errors

---

**Important Notes:**
- ⚠️ **Never commit actual API keys to Git** - Always use placeholders in documentation
- Your API keys should be stored securely in:
  - `.env.local` for local development (already in `.gitignore`)
  - Vercel Environment Variables for production
- This guide uses placeholders - replace `your_gemini_api_key_here` and `your_claude_api_key_here` with your actual keys in Vercel

**Setup Status:**
- ✅ Gemini: Add your key to Vercel using the format above
- ✅ Claude: Add your key to Vercel using the format above  
- ✅ OpenAI: Should already be in Vercel from previous setup

Once you add the keys to Vercel, your users can switch between all three AI providers! 🎉
