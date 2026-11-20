import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { addDumpster, addTruck, setDumpsterStatus } from "@/app/actions/admin";

const f = "rounded-lg bg-slate-900 border border-slate-700 p-2";
export default async function Assets() {
  const u = await requireRole("ADMIN");
  const [dumpsters, trucks, yards] = await Promise.all([
    db.dumpster.findMany({ where: { companyId: u.companyId! }, orderBy: { code: "asc" } }),
    db.truck.findMany({ where: { companyId: u.companyId! }, include: { driver: { include: { user: true } } } }),
    db.yard.findMany({ where: { companyId: u.companyId! } }),
  ]);
  const yardSelect = <select name="yardId" className={f} aria-label="Yard"><option value="">No yard</option>{yards.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select>;
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Assets</h1>
      <section className="space-y-3">
        <h2 className="font-medium">Dumpsters ({dumpsters.length})</h2>
        <form action={addDumpster} className="flex flex-wrap gap-2">
          <input name="code" required placeholder="Code, e.g. WB-2001" className={f} />
          <select name="size" className={f} aria-label="Size">{[10, 20, 30, 40].map((s) => <option key={s} value={`YD${s}`}>{s} yard</option>)}</select>
          {yardSelect}
          <button className="rounded-lg bg-emerald-500 text-slate-950 font-medium px-4">Add dumpster</button>
        </form>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {dumpsters.map((d) => (
            <li key={d.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3 flex justify-between items-center">
              <span>{d.code} · {d.size.replace("YD", "")}yd</span>
              <span className="flex gap-1">
                {(["AVAILABLE", "DEPLOYED", "MAINTENANCE"] as const).map((s) => (
                  <form key={s} action={setDumpsterStatus.bind(null, d.id, s)}>
                    <button aria-pressed={d.status === s} className={`rounded px-2 py-1 text-xs border ${d.status === s ? "bg-emerald-500 text-slate-950 border-emerald-500" : "border-slate-600"}`}>{s.slice(0, 5)}</button>
                  </form>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="font-medium">Trucks ({trucks.length})</h2>
        <form action={addTruck} className="flex flex-wrap gap-2">
          <input name="plate" required placeholder="Plate" className={f} />{yardSelect}
          <button className="rounded-lg bg-emerald-500 text-slate-950 font-medium px-4">Add truck</button>
        </form>
        <ul className="space-y-1">{trucks.map((t) => <li key={t.id}>{t.plate} · {t.driver?.user.name ?? "No driver"}</li>)}</ul>
      </section>
    </main>
  );
}
