# CLAUDE.md — Sierra Estates (i-sierra-2027)

Context for Claude Code / AI sessions. Keep this updated as the project evolves.

## What this is
Sierra Estates — a luxury real-estate (PropTech) platform for the New Cairo market. pnpm + Turborepo monorepo.

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 (strict) · Tailwind 4 · Firebase (client SDK 12 + Admin SDK 13: Firestore, Storage, Auth) · Leaflet maps · next-intl (en/ar) · **Docker n8n Workflow Engine** (`localhost:5678`) · Python API (Docker/Cloud Run). Observability: OpenTelemetry + Arize.

## Deployment Architecture (authoritative)

```
ONE Vercel deployment → apps/sierra-estates-realty (Next.js)
  /                  Public site: listings, search, about, contact
  /listings          Property marketplace
  /concierge/[id]    Client portfolio views
  /admin/login       Staff authentication (Firebase Auth)
  /admin            Unified admin dashboard (tabbed interface)
    Dashboard        → KPIs, activity feed, sync health
    Units            → Inventory CRUD, PropertyFinder publish
    Leads            → CRM, AI matching, approvals
    Deals            → Pipeline management (draft → closed)
    Team             → Staff management
    Media            → Asset hub
    Reports          → Analytics & insights
    Settings         → System configuration
  /api/*             All backend APIs (auth-guarded per route)

Firebase — infrastructure ONLY (no hosting)
  Firestore          Database (staff-gated rules in firestore.rules)
  Storage            Media (rules in storage.rules)
  Auth               Authentication
  Functions          Background jobs (functions/)
```

**`apps/sierra-estates-admin-portal`** — DEPRECATED placeholder. Never connected to Firestore.
Do not deploy it. See its `DEPRECATED.md`. Real admin = `apps/sierra-estates-realty/app/admin/`.

## Config files
- `vercel.json` (root) — Vercel config when root dir = repo root (buildCommand points to the realty app)
- `apps/sierra-estates-realty/vercel.json` — Vercel config when root dir = `apps/sierra-estates-realty` in Vercel dashboard
- `firebase.json` — Functions + Firestore rules + Storage rules + emulators (no hosting)
- `.firebaserc` — Firebase project: `sierra-estates-prod`

## Layout
- `apps/sierra-estates-realty` — main Next.js app and the real codebase (public site + admin suite + all API routes).
- `apps/sierra-estates-admin-portal` — DEPRECATED placeholder. See DEPRECATED.md inside.
- `apps/api` — standalone Python service (Docker/Cloud Run): PropertyFinder sync + bot integration.
- `functions` — Firebase Cloud Functions (ingestion pipeline: collectData, processDataForApp, + pure transform module).
- `packages/*` — shared workspace packages. The realty app consumes `@sierra-estates/agents-core` and `@sierra-estates/obedian`; `packages/db` holds the shared Firestore data layer.
- `workflows` — Node scripts for the external data-sync pipeline, run on schedule by `.github/workflows/external-workflows.yml`.

## Commands (from repo root)
- `pnpm install`
- `pnpm dev` — start Next.js web app (the main app)
- `pnpm build` — build the web app
- `pnpm lint` / `pnpm type-check` / `pnpm test:ci`
- `pnpm deploy:rules` — deploy Firestore + Storage rules
- `pnpm deploy:functions` — deploy Cloud Functions
- Tests: Jest (realty app) + functions. `type-check` is a real CI gate (`tsc --noEmit`). `apps/sierra-estates-realty/next.config.ts` has `ignoreBuildErrors: false`.

## Vercel Setup (one-time in dashboard)
Option A (recommended): Root Directory = `apps/sierra-estates-realty` → uses that app's `vercel.json`
Option B (fallback): Root Directory = repo root → uses root `vercel.json` with correct build cmd

## Conventions
- ESLint flat config (`apps/sierra-estates-realty/eslint.config.mjs`) with `eslint-plugin-unused-imports`; unused vars/args/caught-errors must be `_`-prefixed.
- `apps/sierra-estates-realty/tsconfig.json` excludes `agents/**` and `public/**` from type-check.
- Privileged server work uses the **Admin SDK** (`@/lib/server/firebase-admin`) which BYPASSES Firestore rules. Client uses `@/lib/firebase`.

## Auth model (important)
- Client role: read from Firestore `users/{uid}.role` in {admin, manager, agent} (see `lib/AuthContext.tsx`).
- Server admin check: `verifyAdminRequest` (`lib/server/auth-guard.ts`) — Firebase Bearer token with `role==='admin'`. `verifyRequest` also accepts the `X-SBR-SECRET-KEY` header for service/cron calls.
- Edge middleware (`apps/sierra-estates-realty/middleware.ts`) matches ONLY `/api/orchestrate` — it is NOT broad protection.
- Admin page protection: client-side auth guard in `app/admin/layout.tsx` — redirects to `/admin/login` if not authenticated.
- Firestore/Storage security rules are staff-gated via `users/{uid}.role` (see `firestore.rules`) — pending deploy (see NEXT_STEPS.md).

## API Auth (hardened)
- Admin-only: `viewing-requests`, `concierge/send-whatsapp`, `telegram/setup`, `wealth/roi` → `verifyAdminRequest`
- Service+token: `admin/ingest` → `verifyRequest` (Firebase token OR X-SBR-SECRET-KEY)
- Webhook secret: `telegram/webhook`, `whatsapp/webhook`, `ingest/whatsapp` → conditional SBR_SECRET_KEY check
- Public: `listings`, `leads`, `leads/request-viewing`, `closer/initiate`, `concierge/[leadId]`, `wealth/portfolio`, `whatsapp/heartbeat`

## Reality check
Pre-production. Some services are mock/scaffolded (`MockAIService`, unwired i18n). Test coverage is thin. Older `STATUS.md`/`TODO.md` are aspirational/stale.

## Obsidian Memory Engine & AI Sourcing
- **Vault Location:** `docs/obsidian-vault/` contains the core cognitive and database architecture notes.
- **Rules of Engagement:** For every new task, feature, or bugfix, the AI agent MUST search and read the relevant node in the Obsidian vault (e.g. `Sourcing Pipeline & Lead Aggregator.md`, `WhatsApp CRM & Hand-off Pipeline.md`).
- **Graph Alignment:** Maintain double-bracket `[[Links]]` when editing vault files to preserve the Obsidian graph view.

## Constraints for AI sessions
- GitHub access is scoped to `ahmedfawzy8866/i-sierra-2027` only — do not touch other repos.
- The `main` branch is protected on GitHub. Direct commits are blocked. Never force-push or delete `main`.
- For all changes, checkout a new branch, push it to remote, and open a Pull Request.
- Do not deploy without explicit approval. Never place API keys or credentials in raw code or in chat.
