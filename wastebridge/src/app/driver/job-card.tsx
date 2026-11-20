"use client";
import { useState, useTransition } from "react";
import { addProof } from "@/app/actions/driver";
import { submitStatus } from "@/components/driver-client";
import { STATUS_FLOW } from "@/lib/validators";

type Job = { id: string; type: string; size: string; address: string; lat: number; lng: number; status: string; when: string; photos: number };

const nextOf = (s: string) => STATUS_FLOW[STATUS_FLOW.indexOf(s as any) + 1] as string | undefined;
const label = (s: string) => ({ EN_ROUTE: "Start driving", ARRIVED: "I've arrived", DELIVERED: "Mark delivered", PICKED_UP: "Mark picked up", COMPLETED: "Complete job" } as Record<string, string>)[s] ?? s;

export default function JobCard({ job }: { job: Job }) {
  const [status, setStatus] = useState(job.status);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const next = nextOf(status);

  const advance = () => start(async () => {
    const sent = await submitStatus({ orderId: job.id, status: next! });
    setStatus(next!);
    setMsg(sent ? "" : "Offline. Saved and will sync when you reconnect.");
  });

  const upload = (fd: FormData) => start(async () => {
    const r = await addProof(fd);
    setMsg(r.error ?? "Photo saved.");
  });

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div>
        <p className="text-lg font-semibold">{job.type.replace("_", " ")} · {job.size.replace("YD", "")} yard</p>
        <p className="text-slate-300">{job.address}</p>
        <p className="text-slate-500 text-sm">{job.when} · {status.replace("_", " ")} · {job.photos} photos</p>
      </div>
      <a className="block rounded-xl border border-slate-700 p-4 text-center text-lg" target="_blank" rel="noreferrer"
         href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}&travelmode=driving`}>Navigate</a>
      {next && <button onClick={advance} disabled={pending} className="w-full rounded-xl bg-emerald-500 text-slate-950 text-lg font-semibold p-4">{label(next)}</button>}
      <form action={upload}>
        <input type="hidden" name="orderId" value={job.id} />
        <label className="block rounded-xl border border-dashed border-slate-600 p-4 text-center cursor-pointer">
          Take proof photo
          <input name="photo" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.currentTarget.form?.requestSubmit()} />
        </label>
      </form>
      {msg && <p role="status" className="text-amber-300 text-sm">{msg}</p>}
    </article>
  );
}
