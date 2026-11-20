// Server-side publisher. Silently no-ops when Pusher env vars are missing (local dev).
import Pusher from "pusher";

const enabled = !!process.env.PUSHER_APP_ID && !!process.env.PUSHER_SECRET && !!process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusher = enabled
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!, key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!, cluster: process.env.PUSHER_CLUSTER ?? "us2", useTLS: true,
    })
  : null;

export const companyChannel = (companyId: string) => `company-${companyId}`;

export async function publish(companyId: string, event: string, data: unknown = {}) {
  try { await pusher?.trigger(companyChannel(companyId), event, data); } catch (e) { console.error("pusher", e); }
}
