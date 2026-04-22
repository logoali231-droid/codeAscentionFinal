import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // 🔴 validação mínima REAL
        if (
          credentials?.email === "test@test.com" &&
          credentials?.password === "123456"
        ) {
          return {
            id: "1",
            email: credentials.email,
          };
        }

        return null; // ❌ bloqueia login inválido
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };