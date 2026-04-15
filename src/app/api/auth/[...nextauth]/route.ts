import NextAuth from "@auth/nextjs"
import Credentials from "@auth/nextjs/providers/credentials"
import bcrypt from "bcrypt"
import type { User } from '@prisma/client'
import { findUser } from '@/lib/users'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await findUser(credentials.email as string)
        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) {
          return null
        }

        // Strip password for security
        const { password, ...safeUser } = user
        return safeUser
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { 
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email!
      }
      return session
    },
  },
})

export const GET = handlers.GET
export const POST = handlers.POST
