import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// Removed Prisma import for Edge compatibility
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    Credentials({
      name: "Demo Login",
      credentials: {},
      async authorize() {
        // Use a static demo user for Edge compatibility
        return {
          id: "demo-user-id",
          email: "demo@example.com",
          name: "Demo User"
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development"
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);