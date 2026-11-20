"use client";
import { useActionState } from "react";
import { createOrder } from "@/app/actions/orders";

const field = "w-full rounded-lg bg-slate-900 border border-slate-700 p-3";

export default function OrderForm() {
  const [state, action, pending] = useActionState(createOrder, null as any);
  return (
    <form action={action} className="max-w-md space-y-3">
      <select name="type" className={field} aria-label="Service type">
        <option value="DELIVERY">Delivery</option><option value="PICKUP">Pickup</option>
        <option value="SWAP">Swap</option><option value="DUMP_RETURN">Dump and return</option>
      </select>
      <select name="size" className={field} aria-label="Dumpster size">
        {[10, 20, 30, 40].map((s) => <option key={s} value={`YD${s}`}>{s} yard</option>)}
      </select>
      <input name="address" required placeholder="Delivery address" className={field} />
      <div className="grid grid-cols-2 gap-3">
        <input name="lat" required placeholder="Latitude" defaultValue="39.74" className={field} />
        <input name="lng" required placeholder="Longitude" defaultValue="-104.99" className={field} />
      </div>
      <input name="scheduledAt" type="datetime-local" required className={field} />
      {state?.error && <p role="alert" className="text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-emerald-400">Order placed.</p>}
      <button disabled={pending} className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium p-3">{pending ? "Placing order…" : "Place order"}</button>
    </form>
  );
}
