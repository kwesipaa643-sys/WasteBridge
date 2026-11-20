import Link from "next/link";
import NotificationBell from "@/components/notification-bell";
import ThemeToggle from "@/components/theme-toggle";
const links = [["/admin", "Map"], ["/admin/dispatch", "Dispatch"], ["/admin/routes", "Routes"], ["/admin/assets", "Assets"], ["/admin/customers", "Customers"], ["/admin/people", "People"], ["/admin/analytics", "Analytics"], ["/admin/reports", "Compliance"]];
import { auth } from "@/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = ((await auth())?.user as any)?.role;
  const shown = role === "AGENCY" ? links.filter(([h]) => h === "/admin/reports") : links;
  return (
    <>
      <nav aria-label="Admin" className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex gap-5 overflow-x-auto text-slate-200">
        {shown.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap hover:text-emerald-400">{l}</Link>)}
      <NotificationBell /><ThemeToggle /></nav>
      {children}
    </>
  );
}
