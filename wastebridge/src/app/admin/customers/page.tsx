import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { usd } from "@/lib/pricing";

export default async function Customers() {
  const u = await requireRole("ADMIN");
  const customers = await db.customer.findMany({
    where: { companyId: u.companyId! },
    include: { user: true, orders: true, invoices: true },
  });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-slate-400"><tr><th className="p-2">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Unpaid</th></tr></thead>
        <tbody>{customers.map((c) => (
          <tr key={c.id} className="border-t border-slate-800">
            <td className="p-2">{c.user.name}</td><td>{c.user.email}</td><td>{c.phone ?? "-"}</td><td>{c.orders.length}</td>
            <td>{usd(c.invoices.filter((i) => i.status !== "PAID").reduce((t, i) => t + i.amountCents, 0))}</td>
          </tr>))}
        </tbody></table></div>
    </main>
  );
}
