import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDb } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const db = await getDb()
          const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            // Track failed login attempt
            try {
              const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
              await db.query(
                'INSERT INTO user_logins (user_id, ip_address, user_agent, success) VALUES (NULL, $1, $2, FALSE)',
                [String(ip).split(',')[0], req?.headers?.['user-agent'] || 'unknown']
              )
            } catch (e) {
              // Ignore tracking errors
            }
            return null
          }

          const user = result.rows[0]
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          // Track login attempt (success or failure)
          try {
            const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
            await db.query(
              'INSERT INTO user_logins (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, $4)',
              [user.id, String(ip).split(',')[0], req?.headers?.['user-agent'] || 'unknown', isValid]
            )
          } catch (e) {
            // Ignore tracking errors
          }

          if (!isValid) {
            return null
          }

          return {
            id: String(user.id), // Convert to string for NextAuth compatibility
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
}
