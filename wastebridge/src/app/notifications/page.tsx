import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { markNotificationsRead } from "@/app/actions/admin";

export default async function Notifications() {
  const u = await requireRole("ADMIN", "DRIVER", "CUSTOMER", "AGENCY");
  const items = await db.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-4 max-w-xl">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <form action={markNotificationsRead}><button className="rounded-lg border border-slate-600 px-3 py-1">Mark all read</button></form>
      </div>
      <ul className="space-y-2">{items.map((n) => (
        <li key={n.id} className={`rounded-lg border p-3 ${n.read ? "border-slate-800" : "border-emerald-500"}`}>
          <p className="font-medium">{n.title}</p><p className="text-slate-400">{n.body}</p>
        </li>))}
        {!items.length && <li className="text-slate-400">Nothing yet.</li>}
      </ul>
    </main>
  );
}
