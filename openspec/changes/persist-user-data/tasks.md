# Tasks: Persist User Data Across Sessions

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Resolved
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Base |
|------|------|-----|------|
| 1 | env.ts + storage.ts + .env.example + vite.config | PR 1 | main |
| 2 | biomarkerStore + service migration | PR 2 | PR 1 |
| 3 | Persist 5 stores + store index | PR 3 | PR 2 |
| 4 | Cooldown, locale/tab, export, quality gate | PR 4 | PR 3 |

## Phase 1: Infrastructure

- [x] 1.1 Test → Implement: `src/infrastructure/env.ts` — Zod schema for VITE_STORAGE_PREFIX, VITE_BASE_URL, VITE_LOG_LEVEL
- [x] 1.2 Test → Implement: `src/infrastructure/storage.ts` — createPersistConfig(name, opts), encryptSensitive, decryptSensitive (AES-GCM + PBKDF2)
- [x] 1.3 Create `.env.example` — VITE_STORAGE_PREFIX=nutrefitdia, VITE_BASE_URL=/, VITE_LOG_LEVEL=info
- [x] 1.4 Modify `vite.config.ts` — wire base from env.VITE_BASE_URL

## Phase 2: Biomarker Store

- [x] 2.1 Test → Implement: `src/shared/stores/biomarkerStore.ts` — glucoseHistory, weightHistory, record*, getTrend, resetBiomarkerHistory with persist
- [x] 2.2 Modify `src/shared/services/biomarkerTrackingService.ts` — delegate to biomarkerStore.getState(); preserve public API
- [x] 2.3 Modify `src/shared/stores/index.ts` — export useBiomarkerStore

## Phase 3: Store Persist Wrappers

- [x] 3.1 Test → Wrap: `trackerStore` in persist() — encrypted: weight, height, age, diagnosisAge, glucose, imc
- [x] 3.2 Test → Wrap: `logStore` in persist() — plaintext (non-sensitive food log)
- [x] 3.3 Test → Wrap: `nudgeStore` in persist() — add cooldowns: Record<string,number> + registerCooldown/resetCooldown
- [x] 3.4 Test → Wrap: `activityStore` in persist() — encrypted: weeklyMinutes, strengthSessions
- [x] 3.5 Test → Wrap: `planStore` in persist() — plaintext
- [x] 3.6 Audit all store test files — add localStorage.clear() in beforeEach

## Phase 4: Cooldown Migration

- [x] 4.1 Modify `src/shared/nudge/cooldownTracker.ts` — read/write via useNudgeStore.getState().cooldowns; keep injectable now()
- [x] 4.2 Modify `src/shared/nudge/engine.ts` — remove singleton CooldownTracker; use nudgeStore state
- [x] 4.3 Verify existing CooldownTracker tests pass with nudgeStore backend

## Phase 5: Locale, Tab & Export

- [ ] 5.1 Modify `src/shared/i18n/I18nContext.tsx` — persist locale to localStorage
- [ ] 5.2 Modify `src/shared/hooks/useTabNavigation.ts` — persist tab to sessionStorage
- [ ] 5.3 Test → Implement: `src/shared/hooks/useExportData.ts` — exportAllData() aggregates 6 stores into JSON blob download

## Phase 6: Quality Gate

- [ ] 6.1 Run `pnpm quality` — fix lint, format, type errors
- [ ] 6.2 Run `pnpm test:run` — verify 580+ tests green
- [ ] 6.3 Manual verify: DevTools check encrypted fields, refresh survival, export downloads valid JSON
