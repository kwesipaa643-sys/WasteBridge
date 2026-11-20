// RBAC at the edge. AGENCY users are limited to the compliance reports.
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const rules: Record<string, string[]> = { "/admin": ["ADMIN", "AGENCY"], "/driver": ["DRIVER"], "/customer": ["CUSTOMER"] };

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const prefix = Object.keys(rules).find((p) => pathname.startsWith(p));
  if (!prefix) return;
  const role = (req.auth?.user as any)?.role as string | undefined;
  if (!role || !rules[prefix].includes(role)) return NextResponse.redirect(new URL("/login", req.url));
  if (role === "AGENCY" && !pathname.startsWith("/admin/reports")) return NextResponse.redirect(new URL("/admin/reports", req.url));
});

export const config = { matcher: ["/admin/:path*", "/driver/:path*", "/customer/:path*"] };
