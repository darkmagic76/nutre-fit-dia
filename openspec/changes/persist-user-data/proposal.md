# Proposal: Persist User Data Across Sessions

## Intent

All 5 Zustand stores + biomarker history are pure in-memory. Page refresh = total clinical data loss. The PWA loads offline but opens empty. Add `zustand/persist` middleware with Web Crypto encryption on sensitive health fields so the app survives refresh and works as a real offline-first PWA.

## Scope

### In Scope
- Zustand `persist` on 5 stores: trackerStore, logStore, nudgeStore, activityStore, planStore
- NEW `biomarkerStore` — migrate `glucoseHistory` + `weightHistory` from module-level arrays to persisted store
- NEW `src/infrastructure/storage.ts` — `createPersistConfig()`, `encryptSensitive()`, `decryptSensitive()` using Web Crypto (AES-GCM + PBKDF2)
- NEW `src/infrastructure/env.ts` — Zod schema for `VITE_STORAGE_PREFIX`, `VITE_BASE_URL`, `VITE_LOG_LEVEL`
- NEW `.env.example` (committed)
- Cooldown `Map<string, number>` → `nudgeStore` persisted state
- Locale + active tab → persisted to localStorage
- Export all store data as downloadable JSON (`Blob` + `<a download>`)

### Out of Scope
- IndexedDB (localStorage sufficient for years of data, ~85 KB estimated)
- Schema migration beyond Zustand's built-in `version` field
- Multi-device sync (ADR-011 V2)
- Data import (future feature)

## Capabilities

### New Capabilities
- `biomarker-store`: Persisted store holding `glucoseHistory: GlucoseReading[]` and `weightHistory: WeightReading[]`. Replaces module-level arrays in `biomarkerTrackingService.ts`.
- `infrastructure-storage`: `createPersistConfig(name)`, `encryptSensitive(data)`, `decryptSensitive(data)`. Zero-dependency Web Crypto API. Encryption key derived via PBKDF2.
- `infrastructure-env`: Zod schema validating `VITE_STORAGE_PREFIX`, `VITE_BASE_URL`, `VITE_LOG_LEVEL`. Stores import infrastructure functions, never `import.meta.env` directly.
- `data-export`: `useExportData()` hook — aggregates all store states into JSON blob, triggers browser download.

### Modified Capabilities
- `tracker-store`: Add `persist` middleware. Sensitive fields (`weight`, `height`, `age`, `diagnosisAge`, `glucose`) encrypted before write. Non-sensitive fields plaintext.
- `log-store`: Add `persist` middleware. Food log is non-sensitive — plaintext for performance.
- `plan-store`: Add `persist` middleware (plaintext).
- `nudge-engine`: REQ-NUDGE-COOLDOWN — cooldown `Map<string, number>` moves from in-memory class field to persisted `nudgeStore` state. Cooldown survives refresh.

## Approach

Zustand `persist` middleware on every store via infrastructure wrappers:

```typescript
// per-store pattern
persist((set, get) => ({...}), createPersistConfig('nutrifit-tracker', {
  encrypt: SENSITIVE_FIELDS,
}))
```

`createPersistConfig()` wraps `createJSONStorage` with an encryption layer: serialize → encrypt sensitive keys → write. On read: decrypt → parse → hydrate. Uses `partialize` to exclude actions. `version: 1` from day one.

Implementation order: infrastructure (env + storage) → biomarkerStore → persist 5 stores → cooldown migration → locale/tab → export.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.env.example` | New | Template for `VITE_STORAGE_PREFIX`, `VITE_BASE_URL` |
| `vite.config.ts` | Modified | Wire `VITE_BASE_URL` into base path |
| `src/infrastructure/storage.ts` | New | `createPersistConfig`, Web Crypto encrypt/decrypt |
| `src/infrastructure/env.ts` | New | Zod env schema |
| `src/shared/stores/trackerStore.ts` | Modified | `persist` + encrypted sensitive fields |
| `src/shared/stores/logStore.ts` | Modified | `persist` (plaintext) |
| `src/shared/stores/nudgeStore.ts` | Modified | `persist` + cooldown state |
| `src/shared/stores/activityStore.ts` | Modified | `persist` + encrypted `weeklyMinutes`, `strengthSessions` |
| `src/shared/stores/biomarkerStore.ts` | New | Persisted biomarker history |
| `src/features/recipe-engine/planStore.ts` | Modified | `persist` (plaintext) |
| `src/shared/services/biomarkerTrackingService.ts` | Modified | Delegate to biomarkerStore |
| `src/shared/nudge/cooldownTracker.ts` | Modified | Read/write cooldown from nudgeStore |
| `src/shared/i18n/I18nContext.tsx` | Modified | Persist locale to localStorage |
| `src/shared/hooks/useTabNavigation.ts` | Modified | Persist tab to sessionStorage |
| `src/shared/hooks/useExportData.ts` | New | JSON export hook |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| localStorage quota exceeded | Low | Estimated < 100 KB; monitor via `navigator.storage.estimate()` |
| Test contamination from stale persisted data | Medium | `localStorage.clear()` in `beforeEach` of all store test suites |
| Encryption key loss on browser clear | Low | Encryption for privacy-at-rest, not access control. Salt stored alongside. |
| planStore size (7-day plan) | Low | Plaintext JSON — no size issue under 5 MB limit |

## Rollback Plan

Remove `persist()` wrapper from each store — restore pure `create()`. Remove `biomarkerStore.ts` and restore module-level arrays. Remove `src/infrastructure/storage.ts` and `env.ts`. Users who already have data in localStorage will need to manually clear it (no migration downgrade needed — Zustand `version` mismatch results in clean rehydration).

## Dependencies

- `zustand@5.0.14` (already installed — `persist` middleware included)
- `zod@4.4.3` (already installed for env validation)
- Web Crypto API (browser-native, no polyfill for modern browsers)

## Success Criteria

- [ ] All 5 stores + biomarkerStore survive page refresh — state identical after rehydration
- [ ] Sensitive fields encrypted in localStorage (verify via DevTools — no plaintext `glucose` or `weight`)
- [ ] `pnpm test:run` — 580+ tests, all green
- [ ] `pnpm quality` passes (format + lint + typecheck + tests)
- [ ] Export button produces valid JSON containing all store data
- [ ] PWA loads with persisted data after offline refresh
