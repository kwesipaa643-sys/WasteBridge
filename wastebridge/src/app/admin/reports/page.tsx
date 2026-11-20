import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export default async function Reports() {
  const user = await requireRole("ADMIN", "AGENCY");
  const logs = await db.serviceLog.findMany({ where: { order: { companyId: user.companyId! } }, include: { order: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Service verification log</h1>
        <span className="flex gap-2"><a href="/api/reports/service-logs" className="rounded-lg bg-emerald-500 text-slate-950 font-medium px-4 py-2">Export CSV</a><a href="/api/reports/service-logs-pdf" className="rounded-lg border border-slate-600 px-4 py-2">Export PDF</a></span>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-slate-400"><tr><th className="p-2">Time</th><th>Address</th><th>Status</th><th>Photo</th></tr></thead>
        <tbody>{logs.map((l) => (
          <tr key={l.id} className="border-t border-slate-800">
            <td className="p-2">{l.createdAt.toLocaleString()}</td><td>{l.order.address}</td><td>{l.status.replace("_", " ")}</td>
            <td>{l.photoUrl ? <a className="text-emerald-400" href={l.photoUrl}>View</a> : "-"}</td>
          </tr>))}
        </tbody></table></div>
    </main>
  );
}
