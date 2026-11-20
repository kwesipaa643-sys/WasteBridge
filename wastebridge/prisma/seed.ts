import { PrismaClient, DumpsterSize } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  const company = await db.company.create({ data: { name: "Summit Roll-Off Co." } });
  const yard = await db.yard.create({
    data: { companyId: company.id, name: "Main Yard", lat: 39.7392, lng: -104.9903 },
  });
  await db.user.create({ data: { email: "admin@wastebridge.test", name: "Alex Admin", passwordHash: hash, role: "ADMIN", companyId: company.id } });
  await db.user.create({ data: { email: "agency@wastebridge.test", name: "Pat Inspector", passwordHash: hash, role: "AGENCY", companyId: company.id } });

  const sizes: DumpsterSize[] = ["YD10", "YD20", "YD30", "YD40"];
  for (let i = 0; i < 24; i++) {
    await db.dumpster.create({
      data: {
        companyId: company.id, yardId: yard.id, code: `WB-${1000 + i}`,
        size: sizes[i % 4], status: i < 16 ? "AVAILABLE" : i < 21 ? "DEPLOYED" : "MAINTENANCE",
        lat: yard.lat + (Math.random() - 0.5) * 0.08, lng: yard.lng + (Math.random() - 0.5) * 0.08,
      },
    });
  }
  const driverIds: string[] = [];
  const truckIds: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const truck = await db.truck.create({
      data: { companyId: company.id, yardId: yard.id, plate: `CO-${400 + i}`, lat: yard.lat + i * 0.01, lng: yard.lng - i * 0.01 },
    });
    const u = await db.user.create({ data: { email: `driver${i}@wastebridge.test`, name: `Driver ${i}`, passwordHash: hash, role: "DRIVER", companyId: company.id } });
    const drv = await db.driver.create({ data: { userId: u.id, truckId: truck.id } });
    driverIds.push(drv.id); truckIds.push(truck.id);
  }
  const cu = await db.user.create({ data: { email: "customer@wastebridge.test", name: "Casey Builder", passwordHash: hash, role: "CUSTOMER" } });
  const customer = await db.customer.create({ data: { userId: cu.id, companyId: company.id, phone: "555-0100", address: "120 Larimer St" } });
  const loaded = await db.dumpster.findMany({ where: { status: "AVAILABLE" }, take: 2 });
  await db.dumpster.updateMany({ where: { id: { in: loaded.map((d) => d.id) } }, data: { truckId: truckIds[0], yardId: null } });
  await db.order.create({
    data: { driverId: driverIds[0], status: "ASSIGNED", companyId: company.id, customerId: customer.id, type: "DELIVERY", size: "YD20", address: "120 Larimer St", lat: 39.75, lng: -104.99, scheduledAt: new Date(Date.now() + 864e5) },
  });
  console.log("Seeded. Login: admin@wastebridge.test / password123");
}
main().finally(() => db.$disconnect());
