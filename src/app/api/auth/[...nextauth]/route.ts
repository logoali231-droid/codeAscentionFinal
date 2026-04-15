import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import type { User } from '@prisma/client'
import { findUser } from '@/lib/users'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await findUser(credentials.email as string)
        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) {
          return null
        }

        return user
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: { 
strategy: 'jwt' as const,
  },
  callbacks: {
async jwt({ token, user }: { token: any; user?: User }) {
      if (user) {
        token.id = user.id as string
      }
      return token
    },
async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user = {
          id: token.id as string,
          email: token.email as string
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
