import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { usd } from "@/lib/pricing";
import { SimpleBar } from "./charts";

export default async function Analytics() {
  const user = await requireRole("ADMIN");
  const companyId = user.companyId!;
  const [byStatus, invoices, drivers] = await Promise.all([
    db.order.groupBy({ by: ["status"], where: { companyId }, _count: true }),
    db.invoice.findMany({ where: { order: { companyId } } }),
    db.driver.findMany({ where: { user: { companyId } }, include: { user: true, orders: { where: { status: "COMPLETED" } } } }),
  ]);
  const month = (d: Date) => d.toLocaleString("en-US", { month: "short" });
  const rev: Record<string, number> = {};
  invoices.filter((i) => i.status === "PAID").forEach((i) => { const m = month(i.dueAt); rev[m] = (rev[m] ?? 0) + i.amountCents / 100; });
  const outstanding = invoices.filter((i) => i.status !== "PAID").reduce((t, i) => t + i.amountCents, 0);
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <p>Outstanding: <strong>{usd(outstanding)}</strong></p>
      <div className="grid md:grid-cols-3 gap-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h2 className="mb-2">Jobs by status</h2><SimpleBar data={byStatus.map((s) => ({ status: s.status.replace("_", " "), jobs: s._count }))} xKey="status" yKey="jobs" /></section>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h2 className="mb-2">Paid revenue ($)</h2><SimpleBar data={Object.entries(rev).map(([m, v]) => ({ m, v }))} xKey="m" yKey="v" color="#f59e0b" /></section>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h2 className="mb-2">Completed by driver</h2><SimpleBar data={drivers.map((d) => ({ n: d.user.name, c: d.orders.length }))} xKey="n" yKey="c" color="#38bdf8" /></section>
      </div>
    </main>
  );
}
