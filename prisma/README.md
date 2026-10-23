# Database blueprint

`schema.prisma` maps every shape in `lib/validation.ts` to PostgreSQL tables, plus the future commerce models from TRD §33 (Customer, Order, OrderItem, ContactMessage, SiteSetting). **Nothing reads it yet.** Prisma is intentionally not installed, so the site has no unused dependency.

## Adopting it

1. `npm install prisma @prisma/client` and set `DATABASE_URL` in `.env.local` (Supabase or any PostgreSQL works).
2. `npx prisma migrate dev --name init`.
3. Write a seed script that reads `/brands/<slug>/*.json` and inserts it.
4. Replace the body of `getBrand()` in `lib/brand.ts` with a query that returns the same `BrandBundle` shape, still passed through `parseBrandBundle()`. Pages and components do not change.
5. Before adding any write endpoint (admin, reviews, orders), add authentication and validate input with the Zod schemas in `lib/validation.ts` (TRD §34–35).

Keep secrets such as `DATABASE_URL` server-only: never prefix them with `NEXT_PUBLIC_`.
