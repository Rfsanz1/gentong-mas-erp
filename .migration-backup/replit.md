# Gentong Mas ERP

Indonesian Enterprise Resource Planning system with 40+ modules covering sales, inventory, finance, HR, manufacturing, and more.

## Run & Operate

- `pnpm --filter @workspace/erp run dev` — run the ERP frontend (port 18996)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + Zustand (auth/state)
- UI: Tailwind CSS v4 + shadcn/ui components (Radix primitives)
- API: Express 5 + JWT auth (jsonwebtoken)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/erp/src/` — React+Vite ERP frontend
  - `App.tsx` — main router (60+ lazy-loaded routes, wouter)
  - `pages-next/` — all page components (188 pages, ~40 modules)
  - `layout/OdooLayout.tsx` — main ERP layout (sidebar + topbar)
  - `layout/AppShell.tsx` — reusable app shell component
  - `store/useAuthStore.ts` — auth state (Zustand + JWT)
  - `store/useNotificationStore.ts` — notifications state
  - `services/` — API service modules
  - `nav-configs.tsx` — navigation configs per module
  - `app-configs.ts` — app/module config registry
  - `lib/utils.ts` — shadcn/ui utility (cn function)
- `artifacts/api-server/src/` — Express API server
  - `routes/auth.ts` — JWT auth endpoints (login, refresh, me)
  - `routes/health.ts` — health check
- Vite proxies `/api` → `http://localhost:8080`

## Demo Credentials

- Email: `admin@example.com`
- Password: `admin123`

## Architecture decisions

- Migrated from Next.js (Vercel/v0) to React+Vite (Replit pnpm workspace)
- All Next.js patterns replaced: `useRouter`→wouter `useLocation`, `next/link <Link>`→`<a>`, `useSearchParams`→wouter `useParams`, removed `'use client'` directives
- Wouter used for client-side routing; lazy loading via `React.lazy` + `Suspense`
- Auth is JWT-based; token stored in localStorage; Vite dev proxy forwards `/api` to Express
- shadcn/ui component library retained from original; `lib/utils.ts` provides `cn()` helper

## Product

Gentong Mas ERP covers: Dashboard, Sales, Inventory/Gudang, Finance, Accounting, HR/Payroll, Manufacturing, CRM, Purchasing, AI Analytics, Marketing, E-commerce, Marketplace, Fleet, Maintenance, Quality, Productivity, Project, Helpdesk, POS, and more.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- All page components live in `pages-next/` (not `pages/` or `app/`) — this avoids confusion with Next.js conventions
- The Vite proxy for `/api` only works in dev mode; production uses the artifact router at path `/api`
- The API server's PORT is set to 8080 by the artifact config; do NOT hardcode 5000

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
