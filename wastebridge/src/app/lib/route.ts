// Route suggestion: greedy nearest-neighbor from the yard. Good enough for 5-15 stops; swap for a
// routing API (Mapbox Optimization) when you need real road distances and time windows.
type Stop = { id: string; lat: number; lng: number };
const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
export function nearestNeighbor(start: { lat: number; lng: number }, stops: Stop[]) {
  const left = [...stops], order: Stop[] = [];
  let cur = start, km = 0;
  while (left.length) {
    let bi = 0;
    left.forEach((s, i) => { if (dist(cur, s) < dist(cur, left[bi])) bi = i; });
    const [n] = left.splice(bi, 1);
    km += dist(cur, n); order.push(n); cur = n;
  }
  return { order, km };
}
export const naiveKm = (start: { lat: number; lng: number }, stops: Stop[]) =>
  stops.reduce((t, s, i) => t + dist(i ? stops[i - 1] : start, s), 0);
