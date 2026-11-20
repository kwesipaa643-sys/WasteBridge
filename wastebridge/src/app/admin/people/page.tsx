import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { addCustomer, addDriver, addYard } from "@/app/actions/admin";

const f = "rounded-lg bg-slate-900 border border-slate-700 p-2";
const person = (
  <>
    <input name="name" required placeholder="Full name" className={f} />
    <input name="email" type="email" required placeholder="Email" className={f} />
    <input name="password" type="password" required minLength={8} placeholder="Temporary password (8+)" className={f} />
  </>
);
export default async function People() {
  const u = await requireRole("ADMIN");
  const [yards, drivers] = await Promise.all([
    db.yard.findMany({ where: { companyId: u.companyId! } }),
    db.driver.findMany({ where: { user: { companyId: u.companyId! } }, include: { user: true } }),
  ]);
  const btn = "rounded-lg bg-emerald-500 text-slate-950 font-medium px-4 py-2";
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-8">
      <section className="space-y-2"><h2 className="font-medium">Yards ({yards.length})</h2>
        <form action={addYard} className="flex flex-wrap gap-2">
          <input name="name" required placeholder="Yard name" className={f} /><input name="lat" required placeholder="Latitude" className={f} /><input name="lng" required placeholder="Longitude" className={f} />
          <button className={btn}>Add yard</button></form>
        <ul className="text-slate-300">{yards.map((y) => <li key={y.id}>{y.name}</li>)}</ul></section>
      <section className="space-y-2"><h2 className="font-medium">Drivers ({drivers.length})</h2>
        <form action={addDriver} className="flex flex-wrap gap-2">{person}<button className={btn}>Add driver</button></form>
        <ul className="text-slate-300">{drivers.map((d) => <li key={d.id}>{d.user.name} · {d.user.email}</li>)}</ul></section>
      <section className="space-y-2"><h2 className="font-medium">Add customer</h2>
        <form action={addCustomer} className="flex flex-wrap gap-2">{person}<input name="phone" placeholder="Phone" className={f} /><button className={btn}>Add customer</button></form></section>
    </main>
  );
}
