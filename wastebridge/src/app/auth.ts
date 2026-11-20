import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const homeFor = (role: string) =>
  ({ ADMIN: "/admin", AGENCY: "/admin/reports", DRIVER: "/driver", CUSTOMER: "/customer" } as Record<string, string>)[role] ?? "/login";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(raw) {
        const p = schema.safeParse(raw);
        if (!p.success) return null;
        const user = await db.user.findUnique({ where: { email: p.data.email } });
        if (!user || !(await bcrypt.compare(p.data.password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId } as any;
      },
    }),
  ],
});
