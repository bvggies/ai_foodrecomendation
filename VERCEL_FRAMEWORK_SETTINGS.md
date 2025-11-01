# Vercel Framework Settings

## ✅ Recommended Settings for Next.js

When setting up your project in Vercel, use these framework settings:

### Framework Preset
- **Framework Preset:** `Next.js`
- Vercel should auto-detect this, but you can select it manually if needed

### Build & Development Settings

#### Root Directory
- **Root Directory:** `./` (leave blank or use `./`)
- Your project is at the root level

#### Build Command
- **Build Command:** `npm run build`
- Or: `node node_modules/.bin/next build`
- Default Next.js build command

#### Output Directory
- **Output Directory:** `.next`
- Or: Leave blank (Next.js uses `.next` by default)
- Vercel automatically handles this for Next.js

#### Install Command
- **Install Command:** `npm install`
- Or: Leave blank (Vercel uses `npm install` by default)

#### Development Command
- **Development Command:** `npm run dev`
- For local development only

### Environment Variables (Critical!)

Make sure to add these in **Settings → Environment Variables**:

1. **OPENAI_API_KEY**
   ```
   your_openai_api_key_here
   ```
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **DATABASE_URL**
   ```
   your_neon_database_connection_string_here
   ```
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### Node.js Version
- **Node.js Version:** `18.x` or `20.x`
- Recommended: `18.x` (matches your package.json)

### Advanced Settings (Optional)

#### Function Region
- **Function Region:** `Washington, D.C., USA (iad1)` or your preferred region
- Choose based on your users' location

#### Edge Network
- Keep default settings (Vercel Edge Network enabled)

## 📋 Quick Setup Checklist

When importing your GitHub repo to Vercel:

- [ ] Framework Preset: **Next.js** (auto-detected)
- [ ] Root Directory: `./` or blank
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Environment Variables: Add `OPENAI_API_KEY` and `DATABASE_URL`
- [ ] Deploy!

## 🚀 After First Deployment

1. **Initialize Database:**
   Visit: `https://your-app.vercel.app/api/db/init`

2. **Test Your App:**
   - Try the AI Assistant
   - Generate a recipe
   - Save favorites
   - All data will be stored in Neon database!

## ⚙️ vercel.json Configuration

Your project already has a `vercel.json` file with:
- Framework: `nextjs`
- Build command configured
- Region settings

Vercel will use these settings automatically, but you can override them in the dashboard if needed.

## 🔍 Troubleshooting

**Build fails?**
- Check that Node.js version is 18+ in Vercel settings
- Verify all environment variables are set
- Check build logs for specific errors

**Database connection errors?**
- Verify `DATABASE_URL` is correctly set in environment variables
- Ensure Neon database is accessible (check Neon dashboard)
- Visit `/api/db/init` to initialize tables

**API errors?**
- Check that `OPENAI_API_KEY` is set
- Verify the API key is valid and has credits
