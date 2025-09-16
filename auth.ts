import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    Credentials({
      name: "Demo Login",
      credentials: {},
      async authorize() {
        try {
          // Create or get demo user
          let user = await prisma.user.findFirst({
            where: { email: "demo@example.com" }
          });
          
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: "demo@example.com",
                name: "Demo User"
              }
            });
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Return a default user for demo purposes
          return {
            id: "demo-user-id",
            email: "demo@example.com",
            name: "Demo User"
          };
        }
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