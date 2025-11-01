# Test Accounts and Login Credentials

This document contains test account credentials for development and testing purposes.

⚠️ **IMPORTANT**: These are test accounts only. Change all passwords in production!

## 🔐 Admin Accounts

### Primary Admin
- **Email**: `admin@smartbite.com`
- **Password**: `Admin@123`
- **Role**: Admin
- **Access**: Full admin dashboard access

### Super Admin
- **Email**: `superadmin@smartbite.com`
- **Password**: `SuperAdmin@123`
- **Role**: Admin
- **Access**: Full admin dashboard access

## 👤 Sample User Accounts

### User 1
- **Email**: `john@example.com`
- **Password**: `User@123`
- **Name**: John Doe
- **Role**: User

### User 2
- **Email**: `jane@example.com`
- **Password**: `User@123`
- **Name**: Jane Smith
- **Role**: User

### User 3
- **Email**: `chef@example.com`
- **Password**: `Chef@123`
- **Name**: Chef Master
- **Role**: User

### User 4
- **Email**: `foodie@example.com`
- **Password**: `Foodie@123`
- **Name**: Food Lover
- **Role**: User

## 🚀 How to Create These Accounts

### Option 1: Using the Seed Script (Recommended)

1. Make sure you have your `DATABASE_URL` set in your environment:
   ```bash
   export DATABASE_URL="your_database_connection_string"
   ```

2. Run the seed script:
   ```bash
   node scripts/seed-users.js
   ```

This will automatically:
- Create all admin and user accounts
- Hash passwords securely
- Update existing accounts if they already exist
- Display all login credentials

### Option 2: Manual Creation via Signup Page

1. Go to `/login` page
2. Click "Sign up" or "Create Account"
3. Register with any of the email addresses above
4. If the account exists, just log in directly
5. For admin accounts, you'll need to manually update the role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@smartbite.com';
```

### Option 3: Direct Database Insert

⚠️ **Requires password hashing first!**

Use the seed script instead, as it handles password hashing automatically. If you must do it manually, use bcrypt to hash passwords first.

## 🔧 Setting Up Admin Access

If you already have a user account and want to make it an admin:

1. Connect to your PostgreSQL database
2. Run this SQL:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## 📝 Testing Different User Roles

- **Admin accounts** can access:
  - `/admin` - Admin dashboard
  - All regular user features
  - User management, recipe management, analytics

- **Regular user accounts** can access:
  - `/dashboard` - User dashboard
  - All app features (recipes, meal planner, grocery list, etc.)
  - Cannot access admin panel

## 🔒 Security Notes

- These passwords are for **development/testing only**
- **Never** use these passwords in production
- **Always** change default passwords before going live
- Consider using environment variables for sensitive credentials
- The seed script is safe to run multiple times (it updates existing accounts)

## 📋 Quick Test Checklist

- [ ] Run seed script to create accounts
- [ ] Test admin login (`admin@smartbite.com` / `Admin@123`)
- [ ] Verify admin dashboard access (`/admin`)
- [ ] Test regular user login (`john@example.com` / `User@123`)
- [ ] Verify user dashboard access (`/dashboard`)
- [ ] Test that regular users cannot access `/admin`
- [ ] Test admin user management features
- [ ] Test admin recipe management features
