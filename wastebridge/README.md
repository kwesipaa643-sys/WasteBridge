# WasteBridge (Phase 1)

Foundation: Next.js 15 + Prisma/Postgres + Auth.js RBAC + admin dashboard with 3D Mapbox fleet map and R3F dumpster inventory.

## Run
1. `cp .env.example .env` and fill in `DATABASE_URL`, `AUTH_SECRET` (`npx auth secret`), `NEXT_PUBLIC_MAPBOX_TOKEN`
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run db:seed`
5. `npm run dev` → http://localhost:3000

## Demo logins (password: `password123`)
admin@wastebridge.test · agency@wastebridge.test · driver1@wastebridge.test · customer@wastebridge.test

## Structure
- `prisma/` schema + seed
- `src/auth.ts`, `src/middleware.ts` — Auth.js + role-based route protection
- `src/app/{admin,driver,customer}` — role portals
- `src/components/` — `fleet-map` (Mapbox 3D), `dumpster-3d` (R3F)

## Phase 2 (done)
- Customer ordering (`/customer`, `/customer/order`)
- Admin dispatch board with drag-and-drop (`/admin/dispatch`)
- Server actions with Zod + company scoping (`src/app/actions/orders.ts`)
- Pusher realtime (optional; set the Pusher env vars, otherwise pages update on reload)

## Phase 3 (done)
- Driver PWA at `/driver`: installable, large-button job cards, status flow, Navigate link, proof photos (saved to `public/uploads`, swap `src/lib/storage.ts` for S3), truck inventory
- Offline: service worker caches the app; status updates queue in localStorage and sync on reconnect
- Live GPS from the driver's phone updates the truck on the admin 3D map (needs HTTPS or localhost for geolocation)

## Phase 4 (done)
- Auto-invoice on job completion (flat price per size, `src/lib/pricing.ts`); customer pays via Stripe Checkout at `/customer/invoices`; webhook `/api/stripe/webhook` marks paid (`stripe listen --forward-to localhost:3000/api/stripe/webhook`)
- Customer issue reports notify admins
- `/admin/routes` nearest-neighbor route suggestions with km saved
- `/admin/analytics` Recharts: jobs by status, paid revenue, completions per driver
- `/admin/reports` verification log + CSV export (admin and agency roles)

## Phase 5 (done)
- Admin: `/admin/assets` (add dumpsters/trucks, set bin status), `/admin/customers` (CRM view)
- Notification bell + `/notifications` for every role
- PDF export beside CSV; light/dark toggle (remaps slate utilities in `globals.css`)
- Rate limiting on login and order creation (in-memory; use Redis when running multiple instances)
- Tests: `npm test` (route, rate limit, order validation)

## Phase 6: hardening (done)
- Fixed: Prisma schema formatting, Auth.js edge/middleware split (`auth.config.ts`), login errors, agency role limited to reports
- Uploads now served by an authenticated route from `UPLOAD_DIR` (default `./uploads`), not `/public`
- `/admin/people`: add yards, drivers, customers
- Docker: `docker compose up --build`, then run `npx prisma migrate deploy` and the seed against the db
- Vercel: use a hosted Postgres, set env vars, and replace `src/lib/storage.ts` with Vercel Blob/S3 (serverless disk is ephemeral)
- Status: never built or type-checked in the authoring environment. Run `npm run build` and fix any errors first.

## Next phases
4. Customer portal, Stripe invoicing, compliance exports, analytics
