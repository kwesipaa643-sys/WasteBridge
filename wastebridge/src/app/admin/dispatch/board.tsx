"use client";
// Drag-and-drop dispatch board (native HTML5 DnD, keyboard fallback via per-card <select>).
import { useState, useTransition } from "react";
import { assignOrder } from "@/app/actions/orders";

type Job = { id: string; type: string; size: string; address: string; scheduledAt: string; status: string; driverId: string | null };
type Driver = { id: string; name: string };

export default function Board({ jobs, drivers }: { jobs: Job[]; drivers: Driver[] }) {
  const [pending, start] = useTransition();
  const [over, setOver] = useState<string | null>(null);
  const move = (id: string, driverId: string | null) => start(() => assignOrder(id, driverId));
  const cols = [{ id: null as string | null, name: "Unassigned" }, ...drivers];

  return (
    <div className={`grid gap-3 ${pending ? "opacity-70" : ""}`} style={{ gridTemplateColumns: `repeat(${Math.min(cols.length, 4)}, minmax(0, 1fr))` }}>
      {cols.map((c) => (
        <section
          key={c.id ?? "none"}
          onDragOver={(e) => { e.preventDefault(); setOver(c.id ?? "none"); }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => { setOver(null); move(e.dataTransfer.getData("text/plain"), c.id); }}
          className={`rounded-xl border p-3 min-h-64 ${over === (c.id ?? "none") ? "border-emerald-400 bg-slate-800" : "border-slate-800 bg-slate-900"}`}
        >
          <h2 className="font-medium mb-3">{c.name} <span className="text-slate-400">({jobs.filter((j) => j.driverId === c.id).length})</span></h2>
          <div className="space-y-2">
            {jobs.filter((j) => j.driverId === c.id).map((j) => (
              <article key={j.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", j.id)}
                className="rounded-lg bg-slate-950 border border-slate-700 p-3 cursor-grab text-sm">
                <p className="font-medium">{j.type.replace("_", " ")} · {j.size.replace("YD", "")} yd</p>
                <p className="text-slate-400">{j.address}</p>
                <p className="text-slate-500">{new Date(j.scheduledAt).toLocaleString()} · {j.status.replace("_", " ")}</p>
                <select aria-label="Assign driver" value={j.driverId ?? ""} onChange={(e) => move(j.id, e.target.value || null)}
                  className="mt-2 w-full rounded bg-slate-900 border border-slate-700 p-1">
                  <option value="">Unassigned</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
