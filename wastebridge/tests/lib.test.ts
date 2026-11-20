import { describe, expect, it } from "vitest";
import { nearestNeighbor, naiveKm } from "../src/lib/route";
import { rateLimit } from "../src/lib/rate-limit";
import { orderSchema } from "../src/lib/validators";

const start = { lat: 0, lng: 0 };
describe("route", () => {
  it("visits the closest stop first and never loses stops", () => {
    const stops = [{ id: "far", lat: 0, lng: 2 }, { id: "near", lat: 0, lng: 0.1 }, { id: "mid", lat: 0, lng: 1 }];
    const { order, km } = nearestNeighbor(start, stops);
    expect(order.map((s) => s.id)).toEqual(["near", "mid", "far"]);
    expect(km).toBeLessThanOrEqual(naiveKm(start, stops));
  });
});
describe("rateLimit", () => {
  it("blocks after max hits", () => {
    expect([1, 2, 3].map(() => rateLimit("t", 2, 1000))).toEqual([true, true, false]);
  });
});
describe("orderSchema", () => {
  const ok = { type: "DELIVERY", size: "YD20", address: "120 Larimer St", lat: "39.7", lng: "-104.9", scheduledAt: new Date(Date.now() + 864e5).toISOString() };
  it("accepts valid input", () => expect(orderSchema.safeParse(ok).success).toBe(true));
  it("rejects bad size and short address", () => {
    expect(orderSchema.safeParse({ ...ok, size: "YD99" }).success).toBe(false);
    expect(orderSchema.safeParse({ ...ok, address: "x" }).success).toBe(false);
  });
});
