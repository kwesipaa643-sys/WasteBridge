"use client";
// Subscribes to the company channel and re-fetches server data on any "orders-changed" event.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

export default function LiveRefresh({ companyId, fleet = false }: { companyId: string; fleet?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (!key) return;
    const p = new Pusher(key, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2" });
    const ch = p.subscribe(`company-${companyId}`);
    ch.bind("orders-changed", () => router.refresh());
    if (fleet) ch.bind("fleet-moved", () => router.refresh());
    return () => { p.unsubscribe(`company-${companyId}`); p.disconnect(); };
  }, [companyId, router]);
  return null;
}
