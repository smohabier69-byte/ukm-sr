import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials-provider vereist JWT-sessies; database-sessies werken daar niet mee samen.
  session: { strategy: "jwt" },
  pages: { signIn: "/account" },
  providers: [
    Credentials({
      credentials: { email: {}, wachtwoord: {} },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : undefined;
        const wachtwoord = typeof credentials?.wachtwoord === "string" ? credentials.wachtwoord : undefined;
        if (!email || !wachtwoord) return null;

        const [gebruiker] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!gebruiker?.passwordHash) return null;

        const klopt = await bcrypt.compare(wachtwoord, gebruiker.passwordHash);
        if (!klopt) return null;

        return { id: gebruiker.id, email: gebruiker.email, name: gebruiker.name };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.userId = user.id;
        const [volledig] = await db
          .select({ squareCustomerId: users.squareCustomerId })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        token.squareCustomerId = volledig?.squareCustomerId ?? null;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.squareCustomerId = (token.squareCustomerId as string | null) ?? null;
      }
      return session;
    },
  },
});
