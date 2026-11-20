"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { requireRole } from "@/lib/session";

/** Customer pays an invoice via Stripe Checkout. */
export async function payInvoice(invoiceId: string) {
  const user = await requireRole("CUSTOMER");
  const inv = await db.invoice.findFirst({ where: { id: invoiceId, customer: { userId: user.id }, status: { not: "PAID" } }, include: { order: true } });
  if (!inv) throw new Error("Invoice not found");
  if (!stripe) throw new Error("Payments are not configured (set STRIPE_SECRET_KEY)");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: inv.amountCents, product_data: { name: `Dumpster service, ${inv.order.address}` } } }],
    metadata: { invoiceId: inv.id },
    success_url: `${base}/customer/invoices?paid=1`,
    cancel_url: `${base}/customer/invoices`,
  });
  redirect(session.url!);
}

/** Customer reports a problem; notifies every admin in the company. */
export async function reportIssue(fd: FormData) {
  const user = await requireRole("CUSTOMER");
  const text = String(fd.get("text") ?? "").trim().slice(0, 500);
  if (text.length < 5) return;
  const c = await db.customer.findUnique({ where: { userId: user.id } });
  const admins = await db.user.findMany({ where: { companyId: c!.companyId, role: "ADMIN" } });
  await db.notification.createMany({ data: admins.map((a) => ({ userId: a.id, title: "Customer issue", body: text })) });
}
