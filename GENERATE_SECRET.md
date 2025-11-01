# How to Generate SEED_SECRET

The `SEED_SECRET` is a security key that **you create yourself**. It's just a random string that you'll use to protect the seed endpoint.

## 🔑 Generate SEED_SECRET

### Option 1: Using OpenSSL (Recommended)

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Online Generator:**
- Visit: https://randomkeygen.com/
- Use a "Fort Knox Password" or "CodeIgniter Encryption Keys"

### Option 2: Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Simple Random String

Just create any long random string yourself:
```
my-super-secret-seed-key-2024-vercel-production-abc123xyz
```

**Example outputs:**
- `xK9mP2qR8vL5nT3wY7bC4dF6gH1jK0lM9oP2qR8vL5nT3wY7bC4dF=`
- `aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0=`
- `MyVercelSeedSecret2024!@#$%^&*()`

## 📝 How to Use It

### Step 1: Generate Your Secret

Run one of the commands above to generate a random string. For example:
```
xK9mP2qR8vL5nT3wY7bC4dF6gH1jK0lM9oP2qR8vL5nT3wY7bC4dF=
```

### Step 2: Add to Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Set:
   - **Key**: `SEED_SECRET`
   - **Value**: `xK9mP2qR8vL5nT3wY7bC4dF6gH1jK0lM9oP2qR8vL5nT3wY7bC4dF=`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your app (environment variables only apply after redeploy)

### Step 3: Use the Secret

After redeploying, visit:
```
https://your-app.vercel.app/api/admin/seed-production?secret=xK9mP2qR8vL5nT3wY7bC4dF6gH1jK0lM9oP2qR8vL5nT3wY7bC4dF=
```

Replace `xK9mP2qR8vL5nT3wY7bC4dF6gH1jK0lM9oP2qR8vL5nT3wY7bC4dF=` with your actual secret.

## 💡 Quick Example

**Generate secret:**
```bash
openssl rand -base64 32
# Output: kL9mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR=
```

**Add to Vercel:**
- Key: `SEED_SECRET`
- Value: `kL9mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR=`

**Use it:**
```
https://your-app.vercel.app/api/admin/seed-production?secret=kL9mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR=
```

## ⚠️ Important Notes

- **Keep it secret** - Don't commit it to git
- **Use a strong secret** - At least 32 characters
- **Save it somewhere safe** - You'll need it to seed accounts
- **One-time use** - After seeding, you can remove it if you want (but keep it safe in case you need to seed again)

## 🔒 Security

The secret prevents unauthorized access to the seed endpoint. Only someone with the exact secret can create admin accounts, which protects your production database.

## 🚀 After Seeding

Once accounts are created, you can:
- Remove the `SEED_SECRET` from Vercel (optional)
- Or keep it for future account creation
- Change admin passwords in production
