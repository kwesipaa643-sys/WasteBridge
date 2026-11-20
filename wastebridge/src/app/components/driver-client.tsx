"use client";
// Registers the service worker, streams GPS to the server, and exposes an offline-safe status queue.
import { useEffect } from "react";
import { reportLocation } from "@/app/actions/driver";
import { updateJobStatus } from "@/app/actions/orders";

const QUEUE_KEY = "wb-status-queue";
type Item = { orderId: string; status: string };

const readQueue = (): Item[] => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]"); } catch { return []; } };
const writeQueue = (q: Item[]) => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} };

export async function flushQueue() {
  const q = readQueue();
  const left: Item[] = [];
  for (const item of q) { try { await updateJobStatus(item); } catch { left.push(item); } }
  writeQueue(left);
}

/** Try now; if offline, keep it and retry when the connection returns. Returns true if sent. */
export async function submitStatus(item: Item): Promise<boolean> {
  if (navigator.onLine) { try { await updateJobStatus(item); return true; } catch {} }
  writeQueue([...readQueue(), item]);
  return false;
}

export default function DriverClient() {
  useEffect(() => {
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
    window.addEventListener("online", flushQueue);
    flushQueue();
    let last = 0;
    const watch = navigator.geolocation?.watchPosition(
      (p) => { if (Date.now() - last > 15000) { last = Date.now(); reportLocation(p.coords.latitude, p.coords.longitude).catch(() => {}); } },
      () => {}, { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => { window.removeEventListener("online", flushQueue); if (watch !== undefined) navigator.geolocation.clearWatch(watch); };
  }, []);
  return null;
}
