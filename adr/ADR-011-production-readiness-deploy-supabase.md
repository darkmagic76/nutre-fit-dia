# ADR-011: Production Readiness — Deployment Strategy & Supabase V2

**Status:** proposed
**Date:** 2026-07-25
**Deciders:** darkmagic76, gentle-orchestrator

## Context

Project is at release v1.0.3 (580 tests, PWA offline, complete documentation). Need to evaluate production deployment strategy and Supabase integration path.

### Current State

| Aspect           | Reality                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Supabase in code | Zero — not in `package.json`, not imported, no client initialized                           |
| Data storage     | Static in-memory catalog (`src/shared/data/foods-data.ts`, 34 foods) + Zustand/localStorage |
| Authentication   | None — single-device, local-only                                                            |
| Deployment       | GitHub Actions CI only (quality gate, no deploy step)                                       |
| Build output     | `dist/` — pure static HTML + JS + CSS + SW                                                  |
| Vendor lock-in   | Zero — `dist/` works on any static hosting                                                  |

## Decision

### Part A: Deployment — GitHub Pages (V1, immediate)

**Choice**: GitHub Pages via GitHub Actions workflow.

**Rationale**:

- Zero vendor lock-in: `dist/` is a portable artifact deployable to any CDN in minutes
- Already documented in SETUP.md §7 Option B
- Free tier: unlimited bandwidth for public repos
- Same platform as CI/CD (GitHub Actions)
- Custom domain support via CNAME

**Rejected alternatives**:

- Vercel: vendor-specific features (Edge Functions, ISR) create lock-in
- Cloudflare Pages: good alternative but adds complexity (Wrangler CLI)
- Netlify: equivalent to GitHub Pages but adds another platform

### Part B: Supabase — Deferred to V2

**Choice**: Do NOT integrate Supabase now.

**Rationale**:

- The app works 100% offline — for T2D patients without internet, this is a clinical feature
- Local-first architecture (static catalog + localStorage) is sufficient for TFM and early users
- Adding Supabase now creates auth/ui/data complexity without clinical benefit for single-device usage

**V2 strategy** (when needed):

1. Define `IFoodRepository` and `IAuthProvider` ports in domain layer
2. Implement `SupabaseFoodRepository` and `SupabaseAuthProvider` as infrastructure adapters
3. Migrate food catalog to Supabase table with admin CRUD
4. Add multi-device sync via Supabase Realtime
5. Dietitian dashboard with patient data access

### Part C: README Correction

The README tech stack table claims "Supabase JS 2.87.3" — this is inaccurate. Must be removed until Supabase is actually integrated.

## Pillars Compliance

- **Security by Design**: ✅ GitHub Pages enforces HTTPS. Static SPA has minimal attack surface (no server, no DB)
- **SRP + Modularity**: ✅ V2 strategy uses ports/adapters — Supabase never couples to domain
- **Domain Isolation**: ✅ Current architecture is 100% domain-isolated (no framework coupling)
- **Organizational Scalability**: ✅ V2 ports enable team to swap Supabase for any BaaS without touching features

## Consequences

- ✅ Cero vendor lock-in: `dist/` is portable to any CDN in seconds
- ✅ GitHub Pages is free, documented, and same-platform as CI
- ✅ Offline-first is a clinical feature for T2D patients
- ❌ No auth: patient data lives only on their device (privacy = feature, sync = V2)
- ❌ No multi-device: each device has independent state
- ❌ README must be corrected: remove Supabase from stack table

## Traceability

| Requirement                       | Covered by                                            |
| --------------------------------- | ----------------------------------------------------- |
| ADR-001 (Screaming Architecture)  | Ports/adapters for V2 Supabase                        |
| ADR-009 (Technology Stack)        | GitHub Pages replaces Vercel in deploy strategy       |
| RNF-04 (HTTPS)                    | GitHub Pages enforces TLS by default                  |
| SPECS_TECH §5 (Human-in-the-loop) | Dietitian dashboard deferred to V2 with Supabase auth |
