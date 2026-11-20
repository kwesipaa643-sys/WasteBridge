import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type SessionUser = { id: string; role: string; companyId: string | null };

/** Returns the signed-in user or redirects. Use in every server action. */
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const s = await auth();
  const u = s?.user as any;
  if (!u?.id || !roles.includes(u.role)) redirect("/login");
  return { id: u.id, role: u.role, companyId: u.companyId ?? null };
}
