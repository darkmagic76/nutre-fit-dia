# Proposal: Fix Audit Findings

## Intent

Remediate 32 findings from full 8-skill audit. CRITICAL: hardcoded encryption key + Scope Rule violation. HIGH: missing CSP, SRP breach in trackerStore, useT() in 7 Views. MEDIUM/LOW: missing tests, getByTestId, naming mismatches, i18n bypass, code smells, polysemy docs.

## Scope

| Phase | Severity | Findings | Core work |
|-------|----------|----------|-----------|
| P1 | CRITICAL | SR-1, OW-1/AD-S1 | Move planStore to shared. Replace static KEY_MATERIAL (Web Crypto generateKey + IndexedDB). |
| P2 | HIGH | OW-2/AD-S2, AD-SRP1, CP-1 | CSP + security headers. Extract profileService. Pass `t` as prop to 7 Views. |
| P3 | MEDIUM | TD-1→6, SR-2→5, WM-3, CS-S1→7 | 4 new tests (TDD). 13 getByTestId→accessible. 4 View renames. Spanish errors→i18n. Split long methods. |
| P4 | LOW | DDD-2, CS-D1/D2, AD-UL2 | Polysemy docs. Value wrappers. Rename emptyCounts. |

**Out**: E2E, perf, new features, UI redesign, backend.

## Capabilities

### New
- `content-security-policy`: PWA headers (default-src 'self'; frame-ancestors 'none'; Permissions-Policy)
- `profile-service`: `computeIMC`, `validateProfile`, `buildProfile` — pure domain functions

### Modified
- `store-architecture`: planStore now shared-store (2+ consumers). R1 scenario updated.
- `infrastructure-storage`: static key → user-derived key. Existing data migration required.
- `tracker-store`: domain extracted. Spanish errors → i18n keys.
- `data-export`: import path changes, API unchanged.

## Approach

**P1 (CRITICAL)**:
- Move `planStore.ts` → `shared/stores/`. Update `useExportData.ts` + `RecipeEngineContainer.tsx`. Barrel re-export for compat.
- Replace `KEY_MATERIAL` with `crypto.subtle.generateKey({extractable: false})` stored in IndexedDB. Fallback decrypt with old key, re-encrypt with new.

**P2 (HIGH)**:
- CSP via `<meta>` in `index.html` + `Vite server.headers`. Headers: X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- `src/shared/services/profileService.ts`: pure functions. trackerStore delegates to them.
- 7 Containers pass `translate` prop (typed `TFunction`). 7 Views receive it. Zero `useT()` in Views.

**P3 (MEDIUM)**:
- TDD RED→GREEN→REFACTOR for 4 new tests. Replace 13 getByTestId with getByRole/getByText. Rename 4 Views (`git mv`). Add i18n keys. Split `buildDailyTemplate` (3 methods), `generateWeeklyPlan` (2 methods). Extract CulturalBadges, ZeroWasteBadges.

**P4 (LOW)**:
- Document "validation" polysemy. Create `ModerateMinutes`, `GlucoseInput` value wrappers. Rename `emptyCounts`→`defaultRationCounts`.

## Delivery

`chain_strategy`: stacked-to-main. 4 PRs, review budget ≤400 lines each. Sequential merge.

## Affected Areas

| Area | Impact | P |
|------|--------|---|
| `src/infrastructure/storage.ts` | Modified — key derivation | 1 |
| `src/shared/stores/planStore.ts` | New (moved from feature) | 1 |
| `index.html`, `vite.config.ts` | Modified — CSP | 2 |
| `src/shared/services/profileService.ts` | New | 2 |
| `src/shared/stores/trackerStore.ts` | Modified — domain extracted | 2 |
| 7 View + 7 Container files | Modified — `t` prop | 2 |
| 4 new + 2 modified test files | New/Modified | 3 |
| 4 Views renamed + containers + barrels | Renamed | 3 |
| `es.ts`, `en.ts` | Modified — new keys | 3 |
| `planGenerator.ts`, `PlanView.tsx` | Refactored — split methods | 3 |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Encryption migration breaks existing data | Medium | Fallback decrypt with old key, warn on failure |
| View renames break git blame | Low | `git mv` preserves history |
| Merge conflicts across 4 PRs | Medium | Sequential phases, merge before next |

## Rollback

Each phase reverts independently via PR revert. P1: old key still works if migration kept old format. P2-P4: zero data migration.

## Success Criteria

- [ ] `pnpm quality` + `pnpm verify` — 0 failures, all 680 tests green
- [ ] Zero `from.*@features` imports in `src/shared/`
- [ ] Encryption key NOT a compile-time constant
- [ ] CSP active in prod build
- [ ] Zero `useT()` in View files; 4 Views renamed; 4 new test files
- [ ] Zero `getByTestId` in ErrorBoundary/InstallPrompt tests
- [ ] Spanish errors in i18n, not inline
