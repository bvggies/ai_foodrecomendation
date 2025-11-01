# Admin Dashboard Guide

The SmartBite Admin Dashboard provides comprehensive management tools for platform administrators.

## Accessing the Admin Dashboard

1. **Create an Admin User**: First, you need to manually set a user's role to 'admin' in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Or via SQL directly in your PostgreSQL database.

2. **Login**: Log in with your admin account credentials at `/login`

3. **Access Dashboard**: Click the "Admin" link in the navigation bar (only visible to admin users)

## Admin Features

### 1. Overview Dashboard
- **System Statistics**: View total users, recipes, favorites, meals, and grocery items
- **Recent Users**: See the 5 most recently registered users
- **Top Recipes**: View the most favorited recipes

### 2. User Management
- **View All Users**: Browse all registered users with pagination
- **Edit Users**: 
  - Update user name and email
  - Change user role (user/admin)
  - Reset user password
- **Delete Users**: Remove users from the system (cannot delete your own account)

### 3. Recipe Management
- **View All Recipes**: Browse all recipes in the system
- **Delete Recipes**: Remove recipes from the database

### 4. Analytics
- **User Growth**: Track new user registrations over time
- **Recipe Activity**: Monitor recipe creation trends
- **Favorite Statistics**: See how many users have favorites and which recipes are most popular
- **Meal Planner Stats**: Track meal planning activity
- **Cuisine Distribution**: View the distribution of recipes by cuisine type

## API Endpoints

### Admin Check
- `GET /api/admin/check` - Check if current user is admin

### Statistics
- `GET /api/admin/stats` - Get system-wide statistics

### User Management
- `GET /api/admin/users?page=1&limit=20` - Get paginated list of users
- `PUT /api/admin/users` - Update user information
- `DELETE /api/admin/users?userId=123` - Delete a user

### Recipe Management
- `GET /api/admin/recipes?page=1&limit=20` - Get paginated list of recipes
- `DELETE /api/admin/recipes?recipeId=abc123` - Delete a recipe

### Analytics
- `GET /api/admin/analytics?period=30` - Get analytics data (period in days)

## Security Features

- **Role-Based Access Control**: Only users with `role = 'admin'` can access admin features
- **Middleware Protection**: All admin API routes are protected by `requireAdmin()` middleware
- **Self-Protection**: Admins cannot delete their own accounts
- **Session Validation**: Admin status is checked on every request

## Setting Up Your First Admin

1. Create a regular user account through the signup page
2. Connect to your PostgreSQL database
3. Run this SQL command:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Log in with that account - you'll now see the Admin link in navigation

## Database Schema

The `users` table includes a `role` column:
- `'user'` - Regular user (default)
- `'admin'` - Administrator with full access

## Notes

- Admin dashboard is only accessible to authenticated admin users
- All admin actions are logged in the database
- The dashboard provides real-time statistics
- Pagination is implemented for large datasets
