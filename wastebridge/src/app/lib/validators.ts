import { z } from "zod";

export const orderSchema = z.object({
  type: z.enum(["DELIVERY", "PICKUP", "SWAP", "DUMP_RETURN"]),
  size: z.enum(["YD10", "YD20", "YD30", "YD40"]),
  address: z.string().trim().min(5).max(200),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 36e5, "Pick a future date"),
});

export const STATUS_FLOW = ["ASSIGNED", "EN_ROUTE", "ARRIVED", "DELIVERED", "PICKED_UP", "COMPLETED"] as const;
export const statusSchema = z.object({ orderId: z.string().cuid(), status: z.enum(STATUS_FLOW) });
