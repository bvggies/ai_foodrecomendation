# Troubleshooting Admin Dashboard Login Issues

If you're getting "Invalid email or password" when trying to log in to the admin dashboard, follow these steps:

## 🔍 Step 1: Check Database Connection

Visit this URL in your browser:
```
https://your-app.vercel.app/api/admin/check-db
```

This will tell you:
- ✅ If database is connected
- ✅ If users table exists
- ✅ How many users/admins exist

**If it shows "no admin accounts found"**, you need to seed the accounts (see Step 2).

## 🔍 Step 2: Verify Accounts Were Seeded

Visit this URL (replace with your secret):
```
https://your-app.vercel.app/api/admin/seed-production?secret=05498052960582838371
```

You should see a success message with a list of created accounts. If you get an error, check:
- ✅ `SEED_SECRET` is set in Vercel environment variables
- ✅ You redeployed after setting the environment variable
- ✅ The secret in the URL matches exactly

## 🔍 Step 3: Test Login Credentials

I've created a test endpoint to verify your credentials. You can test if the account exists and if the password is correct:

**Option A: Using curl**
```bash
curl -X POST https://your-app.vercel.app/api/admin/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@smartbite.com","password":"SuperAdmin@123"}'
```

**Option B: Using browser console**
Open browser console (F12) and run:
```javascript
fetch('/api/admin/test-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'superadmin@smartbite.com',
    password: 'SuperAdmin@123'
  })
}).then(r => r.json()).then(console.log)
```

This will tell you:
- ✅ If the user exists
- ✅ If the password is correct
- ✅ What role the user has

## 🔍 Step 4: Check Environment Variables in Vercel

Make sure these are ALL set in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:
1. ✅ `DATABASE_URL` - Your Neon database connection string
2. ✅ `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
3. ✅ `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)
4. ✅ `OPENAI_API_KEY` - Your OpenAI API key
5. ✅ `SEED_SECRET` - Your seed secret (05498052960582838371)

**Important:** After adding/updating environment variables, you MUST redeploy!

## 🔍 Step 5: Verify NEXTAUTH_SECRET

The `NEXTAUTH_SECRET` must be set correctly. If it's missing or incorrect, sessions won't work.

To generate a new one:
```bash
openssl rand -base64 32
```

Then:
1. Set it in Vercel environment variables
2. Redeploy
3. Try logging in again
4. Clear browser cookies/localStorage if needed

## 🔍 Step 6: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on any API route
3. Check for errors in the logs

Common errors:
- `DATABASE_URL not set` → Add it to environment variables
- `NEXTAUTH_SECRET missing` → Add it to environment variables
- `Database connection failed` → Check DATABASE_URL format

## 🔍 Step 7: Verify Database Tables Exist

Visit:
```
https://your-app.vercel.app/api/db/init
```

This will create all necessary tables if they don't exist.

## 🔍 Step 8: Clear Browser Data

Sometimes browser cache/cookies can cause issues:

1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear Cookies and Local Storage for your domain
4. Try logging in again

## 🔍 Step 9: Test with Direct SQL

If you have database access, verify the account exists and has correct password hash:

```sql
SELECT id, email, name, role, 
       CASE 
         WHEN password_hash IS NOT NULL THEN 'Password hash exists'
         ELSE 'NO PASSWORD HASH'
       END as password_status
FROM users 
WHERE email = 'superadmin@smartbite.com';
```

If the account doesn't exist or has no password_hash, run the seed script again.

## 🔧 Common Issues & Solutions

### Issue: "Invalid email or password"
**Possible causes:**
1. Account not seeded → Run seed endpoint
2. Password hash incorrect → Re-seed the account
3. Database connection issue → Check DATABASE_URL
4. NEXTAUTH_SECRET not set → Set and redeploy

### Issue: Login works but can't access /admin
**Possible causes:**
1. User role is not 'admin' → Check with test-login endpoint
2. Admin check failing → Check /api/admin/check response
3. Session not persisting → Check NEXTAUTH_SECRET

### Issue: Session expires immediately
**Possible causes:**
1. NEXTAUTH_SECRET missing → Set in environment variables
2. NEXTAUTH_URL mismatch → Ensure it matches your deployment URL
3. Cookie issues → Clear browser data

## ✅ Quick Checklist

Before reporting issues, verify:
- [ ] `/api/admin/check-db` shows users exist
- [ ] `/api/admin/test-login` confirms password is correct
- [ ] All environment variables are set in Vercel
- [ ] You redeployed after setting environment variables
- [ ] NEXTAUTH_SECRET is set and valid
- [ ] Database tables exist (`/api/db/init`)
- [ ] Browser cookies/localStorage cleared
- [ ] Using correct email: `superadmin@smartbite.com`
- [ ] Using correct password: `SuperAdmin@123`

## 🆘 Still Not Working?

If none of the above works:

1. **Share the response** from `/api/admin/test-login` endpoint
2. **Check Vercel logs** for any errors
3. **Verify** you can connect to the database directly
4. **Try creating a new user** via signup and then manually set role to admin in database

## 📞 Quick Debug Commands

Test if everything is working:

```bash
# 1. Check database
curl https://your-app.vercel.app/api/admin/check-db

# 2. Test login
curl -X POST https://your-app.vercel.app/api/admin/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@smartbite.com","password":"SuperAdmin@123"}'

# 3. Seed accounts (if needed)
curl "https://your-app.vercel.app/api/admin/seed-production?secret=05498052960582838371"
```
