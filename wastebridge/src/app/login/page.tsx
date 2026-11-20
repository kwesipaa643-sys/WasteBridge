import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, homeFor } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  async function action(fd: FormData) {
    "use server";
    const email = String(fd.get("email")).toLowerCase();
    const ip = (await headers()).get("x-forwarded-for") ?? "local";
    // 8 attempts per 10 min per email and per IP
    if (!rateLimit(`login:e:${email}`, 8, 600_000) || !rateLimit(`login:ip:${ip}`, 30, 600_000)) redirect("/login?error=limit");
    const user = await db.user.findUnique({ where: { email }, select: { role: true } });
    try {
      await signIn("credentials", { email, password: String(fd.get("password")), redirectTo: homeFor(user?.role ?? "") });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=invalid");
      throw e; // lets the success redirect through
    }
  }
  return (
    <main className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 p-6">
      <form action={action} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to WasteBridge</h1>
        {error === "limit" && <p role="alert" className="text-red-400">Too many attempts. Wait a few minutes and try again.</p>}
        {error === "invalid" && <p role="alert" className="text-red-400">Wrong email or password.</p>}
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3" />
        <input name="password" type="password" required minLength={8} placeholder="Password" className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3" />
        <button className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium p-3">Sign in</button>
      </form>
    </main>
  );
}
