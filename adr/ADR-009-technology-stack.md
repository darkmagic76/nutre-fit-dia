# ADR-009: Technology Stack — SPA + PWA

**Status:** Superseded (by ADR-011)  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

> **Note:** Superseded by [ADR-011](./ADR-011-production-readiness-deploy-supabase.md) for hosting and backend. Supabase is deferred to V2. This ADR retains the original frontend, state management, PWA, and food catalog decisions which remain valid. Backend, hosting, and CI/CD sections below reflect the current reality after ADR-011.

## Context

The project is a TFM (Master's thesis) for a Type 2 Diabetes management platform. It must be demonstrable, deployable at zero cost, and clinically credible. The README already declares a frontend stack (React 19, Vite 8, TypeScript 6, Zod 4, Tailwind 4, Vitest) but omits backend, database, authentication, state management, mobile strategy, and CI/CD.

This ADR ratifies the declared frontend stack and fills the gaps with decisions aligned to the domain requirements and TFM constraints.

## Decision

### Architecture: Static SPA + PWA (current per ADR-011)

```
┌─────────────────────────────────────────────┐
│  Browser (PWA)                              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  React   │ │ Zustand  │ │ Scanner      │ │
│  │  19 SPA  │◄┤ stores   │◄┤ (mock/ONNX)  │ │
│  └────┬─────┘ └──────────┘ └─────────────┘ │
│       │                                     │
│       │ localStorage / in-memory data       │
│       │ (no backend — static SPA)           │
└───────┼─────────────────────────────────────┘
        │
        │ HTTPS
┌───────┼─────────────────────────────────────┐
│  GitHub Pages (static hosting)              │
│  ┌───────────────────────────────────────┐  │
│  │ dist/ → HTML + JS + CSS + SW          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

<details>
<summary>Original architecture (superseded by ADR-011)</summary>

```
┌─────────────────────────────────────────────┐
│  Browser (PWA)                              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  React   │ │ Zustand  │ │ Scanner      │ │
│  │  19 SPA  │◄┤ stores   │◄┤ (mock/ONNX)  │ │
│  └────┬─────┘ └──────────┘ └─────────────┘ │
│       │                                     │
└───────┼─────────────────────────────────────┘
        │ HTTPS (supabase-js SDK)
┌───────┼─────────────────────────────────────┐
│  Supabase                                   │
│  ┌──────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Auth │ │PostgreSQL│ │ Storage (img)  │  │
│  └──────┘ └──────────┘ └────────────────┘  │
└─────────────────────────────────────────────┘
```

</details>

### Frontend (Ratified from README)

| Technology      | Version | Role                                                 |
| --------------- | ------- | ---------------------------------------------------- |
| React           | 19.2.7  | UI components (Container/Presentational per ADR-001) |
| TypeScript      | 6.0.2   | Type safety, erasableSyntaxOnly                      |
| Vite            | 8.1.1   | Dev server, build, PWA plugin                        |
| Tailwind CSS    | 4.3.2   | Utility-first styling                                |
| Zod             | 4.4.3   | Runtime validation (ADR-002)                         |
| Vitest          | 4.1.10  | Unit and component testing                           |
| Testing Library | 16.3.2  | Behavioral component testing                         |
| Oxlint          | 1.71.0  | Rust-based linting                                   |
| jsdom           | 29.1.1  | Browser environment for tests                        |
| pnpm            | —       | Package manager                                      |

### Backend: No backend — static SPA (current per ADR-011)

The application has **zero backend dependencies**. All data lives on the client:

- **Zustand stores** for application state — persisted to `localStorage`
- **Static food catalog** in `src/shared/data/` — imported at build time
- **No authentication** — single-device, local-only usage for TFM scope

> **Original rationale (superseded):** Supabase was selected for its PostgreSQL database, built-in auth, Row Level Security, and free tier. ADR-011 determined that a static SPA better serves the TFM scope — offline-first is a clinical feature for T2D patients without internet. Supabase integration is deferred to V2 via ports/adapters pattern.

<details>
<summary>Original backend decision (superseded by ADR-011)</summary>

| Criterion          | Supabase                                          | Firebase             | Custom Express    | None (localStorage) |
| ------------------ | ------------------------------------------------- | -------------------- | ----------------- | ------------------- |
| Database           | ✅ PostgreSQL (relational)                        | ❌ Firestore (NoSQL) | ✅                | ❌                  |
| Auth built-in      | ✅ Email + OAuth + roles                          | ✅                   | ❌                | ❌                  |
| Row Level Security | ✅ Patient sees own data, dietitian sees patients | ⚠️ Complex rules     | ❌                | ❌                  |
| Free tier          | ✅ 500MB DB, 50K users                            | ✅                   | ❌ (hosting cost) | ✅                  |
| Real-time          | ✅ Subscriptions                                  | ✅                   | ❌                | ❌                  |
| TFM-appropriate    | ✅ Quick setup, zero ops                          | ✅                   | ❌ Overhead       | ❌ No multi-user    |

**Why relational matters**: the domain model is inherently relational — users have profiles, profiles have glucose readings, plans contain recipes, recipes contain foods, foods belong to categories, dietitians validate plans. PostgreSQL models this naturally. Firestore's document model would force denormalization and compound queries for cross-feature operations.

**Auth roles** (deferred to V2): `patient` (self-registration), `dietitian` (manual invite, validates plans). Both roles were to be enforced via Supabase Row Level Security policies.

**Supabase services planned**: `supabase-js` SDK, Auth (email/password, magic link), PostgreSQL, Storage.

</details>

### State Management: Zustand

**Why Zustand over alternatives:**

| Criterion            | Zustand            | React Context            | Redux Toolkit   |
| -------------------- | ------------------ | ------------------------ | --------------- |
| Boilerplate          | ✅ Minimal         | ✅ Minimal               | ❌ High         |
| Selector performance | ✅ Automatic       | ⚠️ Re-renders whole tree | ✅              |
| DevTools             | ✅ Built-in        | ❌                       | ✅              |
| Cross-feature stores | ✅ Multiple stores | ⚠️ Provider nesting      | ✅ Single store |
| Bundle size          | ✅ ~1KB            | ✅ 0KB                   | ❌ ~12KB        |

**Store architecture** (one per feature, per ADR-001 Scope Rule):

```
src/features/
├── nutritional-traffic-light/
│   └── scannerStore.ts        — Scan history, current classification
├── metabolic-tracker/
│   └── trackerStore.ts        — Glucose readings, weight, IMC, caloric target
├── recipe-engine/
│   └── planStore.ts           — Current plan, recipes, weekly schedule
└── activity-tracker/
    └── activityStore.ts       — Weekly minutes, strength sessions, streaks
```

Cross-feature reads (e.g., NudgeEngine reads from `trackerStore` + `planStore`) are done via store imports, not prop drilling. Per ADR-001: if 2+ features need the same store, it moves to `shared/`.

### Mobile Strategy: PWA V1

**V1 (TFM): Progressive Web App**

- Camera access via `navigator.mediaDevices.getUserMedia()` → feeds `ScannerAdapter`
- Installable on home screen (manifest.json + service worker)
- Offline-capable for food catalog and cached plans
- Activity tracking: manual entry (ADR-006 V1 scope)

**V2 (post-TFM): React Native deferred**

- GoogleFit / AppleHealth native APIs (ADR-006 V2)
- True offline-first with SQLite
- Push notifications (dietitian alerts, hydration nudges)

**Why not React Native now**: the TFM must demonstrate the clinical algorithm and architecture, not production mobile polish. PWA with camera access via browser API is sufficient for the demo and avoids a second codebase.

### Food Catalog: Static for TFM

The README references `shared/data/foods.ts` with 34 items. For TFM:

- **Expand to ~100 foods** covering all 10 FoodCategory groups (ADR-005)
- **Preload environmental data** from AESAN 2022 / EAT-Lancet reference tables (ADR-007)
- **Static JSON import** — no API call, fast, offline-capable
- **Future**: Supabase table with admin UI for CRUD, synced to client on app launch

This is a deliberate TFM tradeoff: static catalog avoids backend complexity for the demo while keeping the domain model intact.

### CI/CD: GitHub Actions (current per ADR-011)

| Workflow     | Trigger                         | Actions                                        |
| ------------ | ------------------------------- | ---------------------------------------------- |
| `ci.yml`     | Push to `develop`, PR to `main` | `pnpm lint`, `pnpm typecheck`, `pnpm test:run` |
| `deploy.yml` | Push to `main`                  | Build + deploy to GitHub Pages                 |

**Hosting**: GitHub Pages (free tier, static site hosting, HTTPS enforced). Deployed from `dist/` via GitHub Actions.

> **Original CI/CD (superseded):** Four workflows were planned (`quality.yml`, `deploy-preview.yml`, `deploy-staging.yml`, `deploy-production.yml`) with Vercel hosting. ADR-011 consolidated to two workflows (`ci.yml` + `deploy.yml`) and switched from Vercel to GitHub Pages to keep deployment on the same platform as CI/CD and avoid vendor-specific features.

### Development Workflow (current per ADR-011)

```
feature/*  →  develop  →  main
   │             │          │
   │         CI gate    deploy to
   │         (ci.yml)   GitHub Pages
   │                     (deploy.yml)
   └────────── quality gate on PRs ─────────┘
```

Per ADR-001 and conventional commits, feature branches follow Screaming Architecture naming: `feat/scanner-dual-qualification`, `fix/nudge-cooldown-overflow`.

## Consequences (updated per ADR-011)

- ✅ Zero-cost deploy: GitHub Pages free tier = $0/month for TFM
- ✅ Zero vendor lock-in: `dist/` is a portable artifact deployable to any CDN
- ✅ Offline-first is a clinical feature: static catalog + localStorage works without internet
- ✅ Static SPA has minimal attack surface (no server, no database, no auth servers)
- ✅ PWA camera access: ScannerAdapter can use real `getUserMedia()` in browser, not just mock
- ✅ Zustand stores aligned to feature boundaries: no accidental coupling, per ADR-001
- ❌ No auth: patient data lives only on their device (privacy = feature, sync = V2)
- ❌ No multi-device: each device has independent state
- ❌ Static food catalog: expanding the catalog requires a deploy, not a database update
- ❌ No offline sync: PWA caches but doesn't sync — acceptable for TFM, insufficient for production

> **Original consequences (superseded):** Supabase vendor lock-in was a concern; now eliminated entirely. Vercel hosting replaced by GitHub Pages for zero vendor lock-in.

## Traceability (updated per ADR-011)

| Requirement                              | Covered by                                        |
| ---------------------------------------- | ------------------------------------------------- |
| ADR-001 (Screaming Architecture)         | Zustand stores per feature, feature-branch naming |
| ADR-002 (Zod + TS6)                      | Ratified in stack                                 |
| ADR-003 (ScannerAdapter)                 | PWA camera via `getUserMedia()`                   |
| ADR-006 (Activity V1 manual)             | PWA, no native Health APIs                        |
| ADR-011 (Production Readiness)           | GitHub Pages hosting, Supabase deferred to V2     |
| SPECS_TECH §5 (Human-in-the-loop)        | Deferred to V2 (dietitian dashboard via Supabase) |
| SPECS_RF RNF-01 (validación profesional) | Deferred to V2 (dietitian role + Supabase auth)   |
| TFM deployability                        | GitHub Pages free tier                            |
