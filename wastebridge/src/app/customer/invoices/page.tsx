import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { payInvoice, reportIssue } from "@/app/actions/billing";
import { usd } from "@/lib/pricing";

export default async function Invoices() {
  const user = await requireRole("CUSTOMER");
  const invoices = await db.invoice.findMany({ where: { customer: { userId: user.id } }, include: { order: true }, orderBy: { dueAt: "desc" } });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Invoices</h1>
      <ul className="space-y-2">
        {invoices.map((i) => (
          <li key={i.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3 flex justify-between items-center gap-3">
            <div>
              <p className="font-medium">{usd(i.amountCents)} · {i.order.address}</p>
              <p className="text-sm text-slate-400">{i.status} · due {i.dueAt.toLocaleDateString()}</p>
            </div>
            {i.status !== "PAID" && <form action={payInvoice.bind(null, i.id)}><button className="rounded-lg bg-emerald-500 text-slate-950 font-medium px-4 py-2">Pay now</button></form>}
          </li>
        ))}
        {!invoices.length && <li className="text-slate-400">Invoices appear here once a job is completed.</li>}
      </ul>
      <form action={reportIssue} className="space-y-2">
        <h2 className="font-medium">Report an issue</h2>
        <textarea name="text" required minLength={5} maxLength={500} rows={3} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3" placeholder="What went wrong?" />
        <button className="rounded-lg border border-slate-600 px-4 py-2">Send to dispatcher</button>
      </form>
    </main>
  );
}
