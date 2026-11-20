"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const dumpster = z.object({ code: z.string().trim().min(3).max(20), size: z.enum(["YD10", "YD20", "YD30", "YD40"]), yardId: z.string().optional() });
const truck = z.object({ plate: z.string().trim().min(3).max(15), yardId: z.string().optional() });

export async function addDumpster(fd: FormData) {
  const u = await requireRole("ADMIN");
  const p = dumpster.parse(Object.fromEntries(fd));
  await db.dumpster.create({ data: { code: p.code, size: p.size, yardId: p.yardId || null, companyId: u.companyId! } });
  revalidatePath("/admin/assets");
}
export async function setDumpsterStatus(id: string, status: "AVAILABLE" | "DEPLOYED" | "MAINTENANCE") {
  const u = await requireRole("ADMIN");
  await db.dumpster.updateMany({ where: { id, companyId: u.companyId! }, data: { status } });
  revalidatePath("/admin/assets");
}
export async function addTruck(fd: FormData) {
  const u = await requireRole("ADMIN");
  const p = truck.parse(Object.fromEntries(fd));
  await db.truck.create({ data: { plate: p.plate, yardId: p.yardId || null, companyId: u.companyId! } });
  revalidatePath("/admin/assets");
}
export async function markNotificationsRead() {
  const s = await requireRole("ADMIN", "DRIVER", "CUSTOMER", "AGENCY");
  await db.notification.updateMany({ where: { userId: s.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
}

const yardSchema = z.object({ name: z.string().trim().min(2).max(60), lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) });
const personSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().toLowerCase(), password: z.string().min(8).max(100), phone: z.string().max(30).optional() });

export async function addYard(fd: FormData) {
  const u = await requireRole("ADMIN");
  const p = yardSchema.parse(Object.fromEntries(fd));
  await db.yard.create({ data: { ...p, companyId: u.companyId! } });
  revalidatePath("/admin/people");
}
export async function addDriver(fd: FormData) {
  const u = await requireRole("ADMIN");
  const p = personSchema.parse(Object.fromEntries(fd));
  const passwordHash = await bcrypt.hash(p.password, 10);
  await db.user.create({ data: { name: p.name, email: p.email, passwordHash, role: "DRIVER", companyId: u.companyId!, driver: { create: {} } } });
  revalidatePath("/admin/people");
}
export async function addCustomer(fd: FormData) {
  const u = await requireRole("ADMIN");
  const p = personSchema.parse(Object.fromEntries(fd));
  const passwordHash = await bcrypt.hash(p.password, 10);
  await db.user.create({ data: { name: p.name, email: p.email, passwordHash, role: "CUSTOMER", customer: { create: { companyId: u.companyId!, phone: p.phone || null } } } });
  revalidatePath("/admin/customers");
}
