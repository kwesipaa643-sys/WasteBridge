// Edge-safe Auth.js config (no DB or bcrypt imports) so middleware can use it.
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.companyId = (user as any).companyId; }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.sub;
      (session.user as any).role = token.role;
      (session.user as any).companyId = token.companyId;
      return session;
    },
  },
} satisfies NextAuthConfig;
