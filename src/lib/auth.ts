// FILE: src/lib/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/client";
import { logger } from "@/lib/logger";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      impersonatorEmail?: string | null;
    } & DefaultSession["user"]
  }
  interface User {
    role?: string;
    impersonatorEmail?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // 如果存在模拟登录 Token，则进行签名和有效期验证
        if (credentials.token) {
          const { verifyImpersonationToken } = await import("@/lib/auth-impersonate");
          const verification = verifyImpersonationToken(user.email as string, credentials.token as string);
          if (!verification.isValid) {
            logger.warn({ email: user.email }, "Impersonation login failed - Invalid or expired token");
            return null;
          }

          logger.info(
            { email: user.email, role: user.role, impersonatorEmail: verification.adminEmail }, 
            "Impersonation Login Success - User authenticated via token"
          );
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            impersonatorEmail: verification.adminEmail || undefined,
          };
        }

        if (!credentials.password || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        logger.info({ email: user.email, role: user.role }, "Authorize Success - User authenticated");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // This should be 'ADMIN' or 'USER'
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.impersonatorEmail = user.impersonatorEmail;
        logger.debug({ role: token.role }, "JWT Callback - Set role in token");
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.impersonatorEmail = token.impersonatorEmail;
        logger.debug({ role: session.user.role }, "Session Callback - Set role in session");
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
