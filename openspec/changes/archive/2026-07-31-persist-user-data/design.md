# Design: Persist User Data Across Sessions

## Technical Approach

Wrap all 6 stores with `zustand/persist` middleware via a shared `createPersistConfig()` factory in `src/infrastructure/storage.ts`. Sensitive health fields encrypted at rest using Web Crypto (AES-256-GCM + PBKDF2). Biomarker history migrated from module-level arrays to a new persisted `biomarkerStore`. Cooldown `Map` moved to `nudgeStore` as `Record<string, number>`. Export hook aggregates all stores into downloadable JSON.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Storage abstraction | `createPersistConfig(name, { sensitiveFields })` in infrastructure | Per-store persist configs inline | Single encryption layer, single env import point, DRY |
| Encryption marker | `{ __encrypted: true, salt, iv, ciphertext }` object in JSON | Prefix strings, separate keys | Self-describing, survives JSON parse, distinguishable in DevTools |
| Biomarker refactor | New `biomarkerStore` with persist, service becomes thin re-export | Direct module-level arrays + custom hydration | Zustand persist handles hydration, versioning, and cleanup automatically |
| Cooldown storage | `Record<string, number>` in nudgeStore persisted state | Keep Map + custom serialization | Zustand `persist` serializes via JSON — `Record` is native, `Map` needs custom serializer |
| Locale persistence | Direct `localStorage.getItem/setItem` in I18nProvider | New uiStore with persist | Single key, two operations — overkill to create a store for one value |
| Tab persistence | `sessionStorage` in useTabNavigation | localStorage or new store | Tab selection is session-level UX state, not permanent user data |

## Encryption Flow

```
User action → store.setState()
    → persist middleware intercepts
    → partialize: strip functions
    → serialize: JSON.stringify
    → for each field in sensitiveFields:
        encryptSensitive(value) → { __encrypted, salt, iv, ciphertext }
    → localStorage.setItem(key, JSON.stringify(data))

Page load → create(persist(...))
    → storage.getItem(key)
    → JSON.parse(localStorage.getItem(key))
    → for each field with __encrypted marker:
        decryptSensitive({ salt, iv, ciphertext }) → plaintext
    → JSON.parse → hydrate store
```

**Crypto primitives**: `PBKDF2` (100k iterations, SHA-256) derives 256-bit key from random 16-byte salt. `AES-GCM` encrypts with random 12-byte IV per call (non-deterministic output). All values base64-encoded.

## Zustand Persist Integration

`createPersistConfig(name, opts?)` returns a `PersistOptions` object:

```typescript
// Signature
function createPersistConfig(name: string, opts?: {
  sensitiveFields?: string[];
}): PersistOptions<object, object>
```

Internal behavior:
1. Reads `env.VITE_STORAGE_PREFIX` for localStorage key: `${prefix}-${name}`
2. Creates `createJSONStorage` backed by localStorage with encrypt/decrypt wrapper
3. `partialize` auto-strips function-typed keys (generic for all stores)
4. `version: 1` from day one for future schema migration

Per-store wiring example (trackerStore):
```typescript
persist((set, get) => ({ /* existing logic */ }), createPersistConfig('tracker', {
  sensitiveFields: ['weight', 'height', 'age', 'diagnosisAge', 'glucose', 'imc'],
}))
```

## Biomarker Store Migration

`biomarkerTrackingService.ts` module-level arrays (`glucoseHistory`, `weightHistory`) become `biomarkerStore` state. The service file re-exports from store via `useBiomarkerStore.getState()`. No callers change — `recordGlucose()`, `recordWeight()`, `getTrend()`, `detectIMCThresholdCrossing()`, `resetBiomarkerHistory()` preserve identical signatures.

The store actions call `get().glucoseHistory.push(...)` + `set()`. `getTrend()` and `detectIMCThresholdCrossing()` read from store state instead of module arrays.

## Cooldown Migration

`nudgeStore` gains `cooldowns: Record<string, number>` + actions `registerCooldown(id)`, `resetCooldown(id?)`. `CooldownTracker` class becomes a thin adapter — `register()` delegates to `useNudgeStore.getState().registerCooldown()`, `isOnCooldown()` reads from `getState().cooldowns[id]` (preserving injectable `now()` for testability). Existing `new CooldownTracker(now)` pattern unchanged. Cooldown data persists across refresh — dismissed nudges stay dismissed.

## Export Design

```json
{
  "tracker": { /* state minus actions */ },
  "log": { "todayLog": [...], "todayValidation": {...} },
  "nudge": { "pending": [...], "history": [...], "cooldowns": {...} },
  "activity": { "weeklyMinutes": 150, ... },
  "plan": { "weeklyPlan": {...} },
  "biomarkerHistory": { "glucoseHistory": [...], "weightHistory": [...] },
  "exportedAt": "2026-07-26T10:00:00.000Z"
}
```

Sensitive fields exported as PLAINTEXT — export is user-facing backup, encryption is only for at-rest localStorage privacy. `Blob` + `<a download>` pattern, zero dependencies.

## Testing Strategy

| Concern | Approach |
|---------|----------|
| localStorage pollution | `localStorage.clear()` + `useXxxStore.setState(defaults)` in every `beforeEach` |
| Crypto in tests | `vi.stubGlobal('crypto', { subtle: mockSubtle })` for encryption unit tests |
| Persist survival | Test via middleware config: create store → `setState()` → read from `storage.getItem()` → assert roundtrip. JSDOM doesn't persist across page reloads |
| Cooldown integration | Existing `CooldownTracker` tests preserved — mock `now` still works. New tests verify cooldown roundtrips through nudgeStore persist |
| Action exclusion | Assert serialized state has zero function-typed keys |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.env.example` | Create | Template: `VITE_STORAGE_PREFIX`, `VITE_BASE_URL`, `VITE_LOG_LEVEL` |
| `src/infrastructure/env.ts` | Create | Zod schema validating 3 env vars, export `env` object |
| `src/infrastructure/storage.ts` | Create | `createPersistConfig`, `encryptSensitive`, `decryptSensitive` — Web Crypto API |
| `src/shared/stores/biomarkerStore.ts` | Create | `glucoseHistory`, `weightHistory` with persist; exports same API as service |
| `src/shared/hooks/useExportData.ts` | Create | `useExportData()` hook — aggregates 6 stores into JSON blob download |
| `src/shared/stores/trackerStore.ts` | Modify | Wrap in `persist()`; sensitive fields: weight, height, age, diagnosisAge, glucose, imc |
| `src/shared/stores/logStore.ts` | Modify | Wrap in `persist()`; plaintext (non-sensitive food log) |
| `src/shared/stores/nudgeStore.ts` | Modify | Wrap in `persist()`; add `cooldowns` state + `registerCooldown`/`resetCooldown` actions |
| `src/shared/stores/activityStore.ts` | Modify | Wrap in `persist()`; sensitive: `weeklyMinutes`, `strengthSessions` |
| `src/features/recipe-engine/planStore.ts` | Modify | Wrap in `persist()`; plaintext |
| `src/shared/services/biomarkerTrackingService.ts` | Modify | Delegate to biomarkerStore via `getState()`; preserve public API |
| `src/shared/nudge/cooldownTracker.ts` | Modify | Read/write `cooldowns` from nudgeStore; keep class + injectable `now()` |
| `src/shared/nudge/engine.ts` | Modify | Remove singleton `cooldownTracker` instantiation (now reads from nudgeStore) |
| `src/shared/stores/index.ts` | Modify | Export `useBiomarkerStore` |
| `src/shared/i18n/I18nContext.tsx` | Modify | Persist locale to `localStorage` on change; hydrate on mount |
| `src/shared/hooks/useTabNavigation.ts` | Modify | Persist tab to `sessionStorage` on change; hydrate on init |
| `vite.config.ts` | Modify | Wire `base` from env if configured |
| `src/shared/stores/trackerStore.test.ts` | Modify | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/stores/logStore.test.ts` | Modify | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/stores/nudgeStore.test.ts` | Modify | Add `localStorage.clear()` in `beforeEach`; add cooldown tests |
| `src/features/recipe-engine/planStore.test.ts` | Modify | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/services/biomarkerTrackingService.test.ts` | Modify | Update to use store-based reset |

## Open Questions

None. All architectural decisions resolved. Ready for `sdd-tasks`.
