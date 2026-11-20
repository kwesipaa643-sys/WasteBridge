import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import NotificationBell from "@/components/notification-bell";
import ThemeToggle from "@/components/theme-toggle";
import LiveRefresh from "@/components/live-refresh";

export default async function CustomerHome() {
  const user = await requireRole("CUSTOMER");
  const customer = await db.customer.findUnique({ where: { userId: user.id } });
  const orders = await db.order.findMany({ where: { customerId: customer!.id }, orderBy: { createdAt: "desc" } });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-4">
      <LiveRefresh companyId={customer!.companyId} />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your orders</h1>
        <span className="flex gap-3"><NotificationBell /><ThemeToggle /></span>
        <Link href="/customer/invoices" className="underline mr-3">Invoices</Link>
        <Link href="/customer/order" className="rounded-lg bg-emerald-500 text-slate-950 font-medium px-4 py-2">New order</Link>
      </div>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="font-medium">{o.type.replace("_", " ")} · {o.size.replace("YD", "")} yard</p>
            <p className="text-slate-400">{o.address} · {o.scheduledAt.toLocaleDateString()}</p>
            <p className="text-emerald-400">{o.status.replace("_", " ")}</p>
          </li>
        ))}
        {!orders.length && <li className="text-slate-400">No orders yet. Place your first one.</li>}
      </ul>
    </main>
  );
}
