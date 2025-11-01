# Free AI Provider Options

## Currently Available Free Providers

### 1. **Gemini Spark** (Google Gemini) ✅ Already Added
- **Free Tier**: Generous free tier available
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Rate Limits**: 60 requests per minute
- **Best For**: General conversations, fast responses
- **Setup**: Add `GEMINI_API_KEY` to environment variables

### 2. **Groq Turbo** (Groq) ✅ Just Added
- **Free Tier**: 14,400 requests/day (very generous!)
- **Get API Key**: https://console.groq.com/
- **Rate Limits**: Up to 14,400 requests per day
- **Best For**: Ultra-fast inference, excellent performance
- **Setup**: Add `GROQ_API_KEY` to environment variables
- **Models Available**: 
  - `llama-3.3-70b-versatile` (default, recommended)
  - `llama-3.1-8b-instant` (faster)
  - `mixtral-8x7b-32768` (good for long context)

## How to Add Groq (Recommended Free Option)

1. **Sign up for Groq**:
   - Visit: https://console.groq.com/
   - Create a free account
   - Navigate to API Keys section
   - Create a new API key

2. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     Variable Name: GROQ_API_KEY
     Value: your_groq_api_key_here
     Environment: Production, Preview, Development
     ```
   - Optional (already has default):
     ```
     Variable Name: GROQ_MODEL
     Value: llama-3.3-70b-versatile
     Environment: Production, Preview, Development
     ```
 
3. **Add to Local Development**:
   - Add to `.env.local`:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     GROQ_MODEL=llama-3.3-70b-versatile
     ```

4. **Redeploy**:
   - Vercel will automatically redeploy
   - Users will see "Groq Turbo" in the AI provider selector

## Other Free Options (Future Additions)

### 3. **Hugging Face Inference API**
- **Free Tier**: Limited requests, many open-source models
- **Get API Key**: https://huggingface.co/settings/tokens
- **Best For**: Access to many specialized models
- **Note**: More complex setup, rate limits vary by model

### 4. **Mistral AI**
- **Free Tier**: Daily token quotas available
- **Get API Key**: https://console.mistral.ai/
- **Best For**: Multilingual tasks, code generation
- **Note**: Free tier has restrictions

### 5. **OpenRouter**
- **Free Tier**: Some free models available through daily credits
- **Get API Key**: https://openrouter.ai/
- **Best For**: Testing multiple models from one API
- **Note**: Credits reset daily

## Recommendation

**Start with Groq** because:
- ✅ Very generous free tier (14,400 requests/day)
- ✅ Ultra-fast inference speed
- ✅ Easy to integrate (OpenAI-compatible API)
- ✅ Excellent model quality (Llama 3.1)
- ✅ No credit card required

Combined with Gemini, you'll have two excellent free options for users!

## Current Provider Status

| Provider | Free? | Status |
|----------|-------|--------|
| Gemini Spark | ✅ Yes | ✅ Available |
| Groq Turbo | ✅ Yes | ✅ Available (after adding API key) |
| ChatGPT | ❌ Paid | Available |
| Claude Wisdom | ❌ Paid | Available |

---

**Next Steps**: Get your Groq API key and add it to Vercel to enable the second free provider option!
