import { auth } from "@/auth";
import { db } from "@/lib/db";
import FleetMap from "@/components/fleet-map";
import Dumpster3D from "@/components/dumpster-3d";
import LiveRefresh from "@/components/live-refresh";

export default async function AdminDashboard() {
  const session = await auth();
  const companyId = (session!.user as any).companyId as string;
  const [trucks, dumpsters, openOrders] = await Promise.all([
    db.truck.findMany({ where: { companyId, lat: { not: null } } }),
    db.dumpster.findMany({ where: { companyId } }),
    db.order.count({ where: { companyId, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
  ]);
  const stat = (s: string) => dumpsters.filter((d) => d.status === s).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4">
      <LiveRefresh companyId={companyId} fleet />
      <header className="flex flex-wrap gap-6 items-baseline">
        <h1 className="text-xl font-semibold">Operations</h1>
        <span>{trucks.length} trucks live</span>
        <span>{openOrders} open jobs</span>
        <span className="text-emerald-400">{stat("AVAILABLE")} available</span>
        <span className="text-amber-400">{stat("DEPLOYED")} deployed</span>
        <span className="text-red-400">{stat("MAINTENANCE")} in maintenance</span>
      </header>
      <div className="grid lg:grid-cols-3 gap-4 h-[70vh]">
        <section className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-800">
          <FleetMap
            trucks={trucks.map((t) => ({ id: t.id, lat: t.lat!, lng: t.lng!, label: t.plate }))}
            dumpsters={dumpsters.filter((d) => d.lat && d.status === "DEPLOYED").map((d) => ({ id: d.id, lat: d.lat!, lng: d.lng!, label: d.code }))}
          />
        </section>
        <section className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <Dumpster3D items={dumpsters.map((d) => ({ id: d.id, size: d.size, status: d.status }))} />
        </section>
      </div>
    </div>
  );
}
