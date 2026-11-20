import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { nearestNeighbor, naiveKm } from "@/lib/route";

export default async function Routes() {
  const user = await requireRole("ADMIN");
  const yard = await db.yard.findFirst({ where: { companyId: user.companyId! } });
  const drivers = await db.driver.findMany({
    where: { user: { companyId: user.companyId! } },
    include: { user: true, orders: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } } },
  });
  const start = { lat: yard?.lat ?? 0, lng: yard?.lng ?? 0 };
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Suggested routes</h1>
      {drivers.filter((d) => d.orders.length).map((d) => {
        const stops = d.orders.map((o) => ({ id: o.id, lat: o.lat, lng: o.lng }));
        const { order, km } = nearestNeighbor(start, stops);
        const saved = naiveKm(start, stops) - km;
        return (
          <section key={d.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="font-medium">{d.user.name} · {km.toFixed(1)} km{saved > 0.1 && <span className="text-emerald-400"> (saves {saved.toFixed(1)} km)</span>}</h2>
            <ol className="list-decimal ml-5 mt-2 text-slate-300">
              {order.map((s) => <li key={s.id}>{d.orders.find((o) => o.id === s.id)!.address}</li>)}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
