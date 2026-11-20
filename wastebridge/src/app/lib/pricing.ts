export const PRICE_CENTS: Record<string, number> = { YD10: 25000, YD20: 35000, YD30: 45000, YD40: 55000 };
export const usd = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
