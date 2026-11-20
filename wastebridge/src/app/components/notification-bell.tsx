import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export default async function NotificationBell() {
  const id = ((await auth())?.user as any)?.id as string | undefined;
  if (!id) return null;
  const n = await db.notification.count({ where: { userId: id, read: false } });
  return <Link href="/notifications" aria-label={`Notifications, ${n} unread`} className="relative">🔔{n > 0 && <span className="ml-1 rounded-full bg-emerald-500 text-slate-950 text-xs px-1.5">{n}</span>}</Link>;
}
