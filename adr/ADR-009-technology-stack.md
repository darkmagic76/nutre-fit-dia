# ADR-009: Technology Stack — SPA + Supabase + PWA

**Status:** Accepted  
**Date:** 2026-07-15  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The project is a TFM (Master's thesis) for a Type 2 Diabetes management platform. It must be demonstrable, deployable at zero cost, and clinically credible. The README already declares a frontend stack (React 19, Vite 8, TypeScript 6, Zod 4, Tailwind 4, Vitest) but omits backend, database, authentication, state management, mobile strategy, and CI/CD.

This ADR ratifies the declared frontend stack and fills the gaps with decisions aligned to the domain requirements and TFM constraints.

## Decision

### Architecture: SPA + BaaS

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

### Backend: Supabase

**Why Supabase over alternatives:**

| Criterion          | Supabase                                          | Firebase             | Custom Express    | None (localStorage) |
| ------------------ | ------------------------------------------------- | -------------------- | ----------------- | ------------------- |
| Database           | ✅ PostgreSQL (relational)                        | ❌ Firestore (NoSQL) | ✅                | ❌                  |
| Auth built-in      | ✅ Email + OAuth + roles                          | ✅                   | ❌                | ❌                  |
| Row Level Security | ✅ Patient sees own data, dietitian sees patients | ⚠️ Complex rules     | ❌                | ❌                  |
| Free tier          | ✅ 500MB DB, 50K users                            | ✅                   | ❌ (hosting cost) | ✅                  |
| Real-time          | ✅ Subscriptions                                  | ✅                   | ❌                | ❌                  |
| TFM-appropriate    | ✅ Quick setup, zero ops                          | ✅                   | ❌ Overhead       | ❌ No multi-user    |

**Why relational matters**: the domain model is inherently relational — users have profiles, profiles have glucose readings, plans contain recipes, recipes contain foods, foods belong to categories, dietitians validate plans. PostgreSQL models this naturally. Firestore's document model would force denormalization and compound queries for cross-feature operations.

**Auth roles**:

- `patient` — default role, self-registration
- `dietitian` — assigned manually or via invite, validates plans
- Both roles enforced via Supabase Row Level Security policies

**Supabase services used**:

- `supabase-js` SDK (client-side, anon key)
- Auth (email/password, magic link)
- PostgreSQL (data tables, RLS policies)
- Storage (recipe images, food photos)

**Services NOT used in V1**:

- Edge Functions (no serverless compute needed for TFM)
- Realtime (deferred to V2 for dietitian notifications)

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

### CI/CD: GitHub Actions

| Workflow                | Trigger            | Actions                                        |
| ----------------------- | ------------------ | ---------------------------------------------- |
| `quality.yml`           | Push to any branch | `pnpm lint`, `pnpm typecheck`, `pnpm test:run` |
| `deploy-preview.yml`    | PR to `develop`    | Build + deploy to Vercel preview URL           |
| `deploy-staging.yml`    | Push to `staging`  | Build + deploy to staging environment          |
| `deploy-production.yml` | Push to `main`     | Build + deploy to production                   |

**Hosting**: Vercel (free tier, optimal for Vite SPA, preview deployments per PR).

### Development Workflow

```
feature/*  →  develop  →  staging  →  main
   │              │           │          │
   │         PR checks    manual QA   production
   │         + preview    + smoke     deploy
   └────────── quality gate on every push ──────────┘
```

Per ADR-001 and conventional commits, feature branches follow Screaming Architecture naming: `feat/scanner-dual-qualification`, `fix/nudge-cooldown-overflow`.

## Consequences

- ✅ Zero-cost deploy: Supabase free tier + Vercel hobby = $0/month for TFM
- ✅ Relational integrity: PostgreSQL enforces clinical data constraints at the database level
- ✅ Auth + roles from day one: patient/dietitian distinction enables Human-in-the-loop (SPECS_TECH §5)
- ✅ PWA camera access: ScannerAdapter can use real `getUserMedia()` in browser, not just mock
- ✅ Zustand stores aligned to feature boundaries: no accidental coupling, per ADR-001
- ❌ Supabase vendor lock-in: migration to custom backend requires rewriting auth + data layer
- ❌ Static food catalog: outdated data requires a deploy, not a database update
- ❌ No offline-first: PWA caches but doesn't sync — acceptable for TFM, insufficient for production

## Traceability

| Requirement                              | Covered by                                        |
| ---------------------------------------- | ------------------------------------------------- |
| ADR-001 (Screaming Architecture)         | Zustand stores per feature, feature-branch naming |
| ADR-002 (Zod + TS6)                      | Ratified in stack                                 |
| ADR-003 (ScannerAdapter)                 | PWA camera via `getUserMedia()`                   |
| ADR-006 (Activity V1 manual)             | PWA, no native Health APIs                        |
| SPECS_TECH §5 (Human-in-the-loop)        | Supabase Auth roles (patient/dietitian)           |
| SPECS_RF RNF-01 (validación profesional) | Dietitian role + RLS policies                     |
| TFM deployability                        | Vercel + Supabase free tiers                      |
