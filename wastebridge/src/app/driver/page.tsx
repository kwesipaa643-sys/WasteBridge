import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import NotificationBell from "@/components/notification-bell";
import ThemeToggle from "@/components/theme-toggle";
import DriverClient from "@/components/driver-client";
import JobCard from "./job-card";

export default async function DriverHome() {
  const user = await requireRole("DRIVER");
  const driver = await db.driver.findUnique({ where: { userId: user.id }, include: { truck: { include: { carrying: true } } } });
  const jobs = await db.order.findMany({
    where: { driverId: driver!.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    orderBy: { scheduledAt: "asc" },
    include: { _count: { select: { logs: { where: { photoUrl: { not: null } } } } } },
  });
  const cargo = driver?.truck?.carrying ?? [];
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 space-y-4 max-w-lg mx-auto">
      <DriverClient />
      <div className="flex justify-between items-center"><h1 className="text-2xl font-semibold">Today's jobs</h1><span className="flex gap-3"><NotificationBell /><ThemeToggle /></span></div>
      <section className="rounded-2xl border border-slate-800 p-4">
        <h2 className="font-medium mb-2">On your truck ({cargo.length})</h2>
        <p className="text-slate-400 text-sm">{cargo.length ? cargo.map((d) => `${d.code} (${d.size.replace("YD", "")}yd)`).join(", ") : "No bins loaded"}</p>
      </section>
      {jobs.map((j) => (
        <JobCard key={j.id} job={{ id: j.id, type: j.type, size: j.size, address: j.address, lat: j.lat, lng: j.lng, status: j.status, when: j.scheduledAt.toLocaleString(), photos: j._count.logs }} />
      ))}
      {!jobs.length && <p className="text-slate-400">No jobs assigned. You're all caught up.</p>}
    </main>
  );
}
