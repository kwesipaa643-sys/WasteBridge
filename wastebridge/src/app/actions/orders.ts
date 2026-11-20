"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { orderSchema, statusSchema } from "@/lib/validators";
import { publish } from "@/lib/realtime";
import { PRICE_CENTS } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

/** Customer places an order. */
export async function createOrder(_prev: unknown, fd: FormData) {
  const user = await requireRole("CUSTOMER");
  if (!rateLimit(`order:${user.id}`, 10, 3600_000)) return { error: "Too many orders. Try again later." };
  const parsed = orderSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const customer = await db.customer.findUnique({ where: { userId: user.id } });
  if (!customer) return { error: "Customer profile not found" };
  await db.order.create({ data: { ...parsed.data, customerId: customer.id, companyId: customer.companyId } });
  await publish(customer.companyId, "orders-changed");
  revalidatePath("/customer");
  return { ok: true };
}

/** Admin assigns (or unassigns, driverId = null) an order. Scoped to the admin's company. */
export async function assignOrder(orderId: string, driverId: string | null) {
  const user = await requireRole("ADMIN");
  const order = await db.order.findFirst({ where: { id: orderId, companyId: user.companyId! } });
  if (!order) throw new Error("Order not found");
  if (driverId) {
    const driver = await db.driver.findFirst({ where: { id: driverId, user: { companyId: user.companyId! } } });
    if (!driver) throw new Error("Driver not found");
  }
  await db.order.update({
    where: { id: orderId },
    data: { driverId, status: driverId ? "ASSIGNED" : "PENDING" },
  });
  if (driverId) {
    const d = await db.driver.findUnique({ where: { id: driverId } });
    await db.notification.create({
      data: { userId: d!.userId, title: "New job assigned", body: `${order.type} at ${order.address}` },
    });
  }
  await publish(user.companyId!, "orders-changed");
  revalidatePath("/admin/dispatch");
}

/** Driver advances job status; must own the job. Writes a ServiceLog and notifies the customer. */
export async function updateJobStatus(input: { orderId: string; status: string }, note?: string) {
  const user = await requireRole("DRIVER");
  const p = statusSchema.parse(input);
  const order = await db.order.findFirst({
    where: { id: p.orderId, driver: { userId: user.id } },
    include: { customer: true },
  });
  if (!order) throw new Error("Job not found");
  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { status: p.status } }),
    db.serviceLog.create({ data: { orderId: order.id, status: p.status, note } }),
    db.notification.create({
      data: { userId: order.customer.userId, title: "Order update", body: `Your order is now ${p.status.replace("_", " ").toLowerCase()}` },
    }),
  ]);
  if (p.status === "COMPLETED") {
    // Auto-invoice once, due in 14 days.
    await db.invoice.upsert({
      where: { orderId: order.id }, update: {},
      create: { orderId: order.id, customerId: order.customerId, amountCents: PRICE_CENTS[order.size], status: "SENT", dueAt: new Date(Date.now() + 14 * 864e5) },
    });
  }
  await publish(order.companyId, "orders-changed");
  revalidatePath("/driver");
}
