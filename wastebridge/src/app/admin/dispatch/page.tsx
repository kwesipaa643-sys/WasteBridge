import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import LiveRefresh from "@/components/live-refresh";
import Board from "./board";

export default async function Dispatch() {
  const user = await requireRole("ADMIN");
  const companyId = user.companyId!;
  const [orders, drivers] = await Promise.all([
    db.order.findMany({ where: { companyId, status: { notIn: ["COMPLETED", "CANCELLED"] } }, orderBy: { scheduledAt: "asc" } }),
    db.driver.findMany({ where: { user: { companyId } }, include: { user: true } }),
  ]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4">
      <LiveRefresh companyId={companyId} />
      <h1 className="text-xl font-semibold">Dispatch</h1>
      <Board
        jobs={orders.map((o) => ({ id: o.id, type: o.type, size: o.size, address: o.address, status: o.status, driverId: o.driverId, scheduledAt: o.scheduledAt.toISOString() }))}
        drivers={drivers.map((d) => ({ id: d.id, name: d.user.name }))}
      />
    </div>
  );
}
