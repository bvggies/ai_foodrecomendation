# Admin Registration Guide

This guide explains how to create a secret link for registering admin users.

## 🔗 Secret Admin Registration Link

Instead of manually updating the database or using the seed script, you can create a secret registration link that allows users to sign up directly as admins.

## 🎯 How It Works

1. **Set a Registration Token** in your environment variables
2. **Share the Secret Link** with trusted users
3. **Users click the link** and register as admin
4. **They're automatically logged in** with admin access

## 📝 Setup Instructions

### Step 1: Set Environment Variable

Add this to your Vercel environment variables (or `.env.local` for local):

```
ADMIN_REGISTER_TOKEN=your-secret-token-here-12345
```

**You can use the same token as `SEED_SECRET`** or generate a different one.

### Step 2: Create the Registration Link

Format:
```
https://your-app.vercel.app/register-admin?token=your-secret-token-here-12345
```

**Example:**
```
https://smartbite.vercel.app/register-admin?token=05498052960582838371
```

### Step 3: Share the Link

Share this link with users who should have admin access. They can:
- Click the link
- Fill out the registration form
- Automatically become admin users
- Be logged in and redirected to `/admin`

## 🔒 Security Features

- **Token Verification**: Link only works with the correct token
- **One-time Use**: Users can register multiple admins using the same token (token doesn't expire)
- **Automatic Role Assignment**: Users created through this link automatically get `admin` role
- **Existing Users**: If email already exists, the user is upgraded to admin

## 📋 Usage Examples

### For Vercel Deployment:

1. **Set in Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Add: `ADMIN_REGISTER_TOKEN` = `05498052960582838371`
   - Redeploy

2. **Share Link:**
   ```
   https://your-app.vercel.app/register-admin?token=05498052960582838371
   ```

3. **User Registration:**
   - User clicks link
   - Fills form (name, email, password)
   - Gets admin access immediately

### For Local Development:

1. **Add to `.env.local`:**
   ```
   ADMIN_REGISTER_TOKEN=dev-admin-token-123
   ```

2. **Use Link:**
   ```
   http://localhost:3000/register-admin?token=dev-admin-token-123
   ```

## 🔄 Updating Existing Users

If a user with the email already exists:
- Their password is updated
- Their role is changed to `admin`
- They keep their existing data

## 🆚 Comparison with Seed Script

| Method | Use Case |
|--------|----------|
| **Seed Script** | Initial setup, bulk account creation |
| **Secret Link** | Individual admin registration, on-demand |

## ⚠️ Security Notes

- **Keep the token secret** - Don't commit it to git
- **Use strong tokens** - Generate with `openssl rand -base64 32`
- **Share securely** - Send via secure channels only
- **Rotate if exposed** - Change token if compromised
- **Monitor usage** - Check admin accounts regularly

## 🎯 Best Practices

1. **Use different tokens** for different environments (dev/staging/prod)
2. **Revoke access** by changing the token in production
3. **Document token** in secure password manager
4. **Limit distribution** - only share with trusted individuals
5. **Use after initial setup** - seed script for first admins, link for additional admins

## 📞 Quick Reference

**Registration URL Format:**
```
/register-admin?token=YOUR_TOKEN
```

**Environment Variable:**
```
ADMIN_REGISTER_TOKEN=your-token-here
```

**Default Behavior:**
- If `ADMIN_REGISTER_TOKEN` is not set, falls back to `SEED_SECRET`
- If neither is set, registration will fail

## ✅ Testing

Test the link by:
1. Setting `ADMIN_REGISTER_TOKEN` in environment
2. Visiting `/register-admin?token=YOUR_TOKEN`
3. Filling the form
4. Verifying you're redirected to `/admin`
5. Checking your role in database is `admin`
