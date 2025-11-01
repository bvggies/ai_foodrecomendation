-- Seed script to create admin accounts and sample users
-- Run this SQL script directly in your PostgreSQL database

-- Note: Passwords are hashed using bcrypt. Run the JavaScript seed script instead:
-- node scripts/seed-users.js

-- Or manually hash passwords and insert:
-- Example: password 'Admin@123' hashes to (you need to generate this)

-- Admin Users
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@smartbite.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin'),
('superadmin@smartbite.com', '$2a$10$YourHashedPasswordHere', 'Super Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- Sample Regular Users
INSERT INTO users (email, password_hash, name, role) VALUES
('john@example.com', '$2a$10$YourHashedPasswordHere', 'John Doe', 'user'),
('jane@example.com', '$2a$10$YourHashedPasswordHere', 'Jane Smith', 'user'),
('chef@example.com', '$2a$10$YourHashedPasswordHere', 'Chef Master', 'user'),
('foodie@example.com', '$2a$10$YourHashedPasswordHere', 'Food Lover', 'user')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;
