import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user || user.length === 0) {
            return null;
          }

          const foundUser = user[0];

          // Check if user is active
          if (!foundUser.isActive) {
            return null;
          }

          // Check if user has set their password
          if (!foundUser.isPasswordSet || !foundUser.passwordHash) {
            throw new Error("Please complete your account setup first");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            foundUser.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (without password hash)
          return {
            id: foundUser.id,
            email: foundUser.email,
            name: `${foundUser.firstName} ${foundUser.lastName}`.trim(),
            role: foundUser.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
