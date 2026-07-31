# Design: Fix Audit Findings

## Technical Approach

Four sequential PRs, each independently revertible. Phase 1 addresses the two CRITICAL findings (Scope Rule violation + hardcoded key). Each subsequent phase stacks on the previous. No database, no backend — pure frontend refactor.

## Architecture Decisions

| # | Decision | Option A | Option B | Choice | Rationale |
|---|----------|----------|----------|--------|-----------|
| AD1 | planStore relocation | Feature barrel re-export | Search-and-replace all 3 imports | **A** | Barrel preserves git blame on existing imports; new imports from `@shared/stores` going forward |
| AD2 | CryptoKey persistence | IndexedDB (non-extractable key) | sessionStorage (key serialized to string) | **A** | Non-extractable keys cannot be exfiltrated via script; IndexedDB survives tab close. Fallback to session-only when unavailable |
| AD3 | Old-key migration | Silent fallback decrypt then re-encrypt | Hard error, user loses data | **A** | UX-first: re-encrypt transparently so no data loss. Old `KEY_MATERIAL` removed after migration |
| AD4 | `t` prop type | `Translations` (existing typed record) | Raw `(key: string) => string` | **A** | Type-safe with existing `Translations` interface. View tests pass typed fixtures |
| AD5 | CSP delivery | `<meta>` in `index.html` (already present) + Vite `server.headers` for dev | Nginx/Apache only | **A** | PWA has no server — `<meta>` is the correct delivery. Dev mode relaxes via Vite config |

## Phase 1: planStore Move + Encryption

### planStore Migration

```
BEFORE                              AFTER
src/features/recipe-engine/         src/shared/stores/
  planStore.ts  (60 lines)            planStore.ts  (moved, unchanged content)
                                    src/features/recipe-engine/
                                      planStore.ts  (barrel re-export)

Import update:
  useExportData.ts:6  @/features/recipe-engine/planStore → @shared/stores/planStore
  RecipeEngineContainer.tsx:1  ./planStore → @shared/stores/planStore
```

Barrel file at `src/features/recipe-engine/planStore.ts`:
```typescript
// Backward-compat barrel — planStore is now a shared store (2+ consumers)
export { usePlanStore } from '@shared/stores/planStore';
```

### Encryption Key Flow

```
App Init
  │
  ├─ IndexedDB has key? ──YES──▶ decrypt/encrypt with restored key
  │
  └─ NO
      │
      ├─ localStorage has old-format data?
      │   ├─ YES: decrypt with old KEY_MATERIAL → re-encrypt with new key
      │   │      → store new key in IndexedDB → delete old localStorage
      │   └─ NO:  crypto.subtle.generateKey(AES-GCM, extractable:false)
      │           → store in IndexedDB
      │
      └─ IndexedDB unavailable?
          └─ generateKey in-memory (session-only, warn user)
```

`storage.ts` changes:
- Remove `KEY_MATERIAL` constant (line 4)
- Replace `deriveAesKey()` with `getOrCreateKey()`: loads from IndexedDB or generates
- `encryptSensitive`/`decryptSensitive`: use key from `getOrCreateKey()` directly (no PBKDF2 derive step)

## Phase 2: CSP + profileService + useT() Prop

### CSP — Already Present, Add Dev Relaxation

`index.html` already has `<meta http-equiv="Content-Security-Policy">`. Missing:
- Vite `server.headers` for dev-mode relaxed CSP (allows HMR WebSocket)
- `dist/_headers` for deployment

```typescript
// vite.config.ts addition
server: {
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:*",
  },
},
```

### profileService Extraction

Files:
- **New**: `src/shared/services/profileService.ts` — pure functions, no framework imports
- **Modified**: `src/shared/stores/trackerStore.ts` — delegates to profileService

Functions extracted:
- `computeIMC(weight, height)` — already in `@shared/utils/imc.ts`; re-export via profileService
- `validateProfile(profile): ValidationResult` — extracts lines 82-93, 120-147 from trackerStore
- `buildProfile(input): UserProfile` — merges partial input with defaults

trackerStore after extraction: calls `profileService.validateProfile()` and `profileService.computeIMC()`. Store only holds state + calls services.

### useT() → translate Prop

```
BEFORE                              AFTER
View calls useT()                   View receives translate: Translations prop
  const t = useT()                    export function View({ translate, ... }: Props)
  <p>{t['key']}</p>                   <p>{translate['key']}</p>
                                    
Container calls useT()              Container calls useT(), passes to View
                                      const t = useT()
                                      <View translate={t} ... />
```

7 files changed per side (14 files total): ActivityTrackerView, DailyLogView, MetabolicTrackerView, NudgePanelView, ScannerView, PlanView, SustainabilityView — plus their containers.

## Phase 3: Tests + Naming + i18n + Smells

### New Tests (TDD)
4 test files, AAA pattern, getByRole/getByText preferred:
- `ActivityTrackerContainer.test.tsx`, `ActivityTrackerView.test.tsx`
- `NudgeEngineContainer.test.tsx`, `SustainabilityView.test.tsx`

### getByTestId → Accessible
| File | Replacements |
|------|-------------|
| `ErrorBoundary.test.tsx` | 9× `getByTestId` → `getByRole('alert')`, `getByText()`, `getByRole('button')` |
| `InstallPrompt.test.tsx` | 4× `getByTestId` → `getByRole('button')`, `getByText()` |

### View Renames (git mv)
| Before | After |
|--------|-------|
| `DailyLogView.tsx` | `MedDietValidatorView.tsx` |
| `ScannerView.tsx` | `NutritionalTrafficLightView.tsx` |
| `NudgePanelView.tsx` | `NudgeEngineView.tsx` |
| `PlanView.tsx` | `RecipeEngineView.tsx` |

Update: Container imports, barrel exports, test files.

### i18n Keys Added
New keys in `types.ts`, `es.ts`, `en.ts`:
- `errors.invalidGender`
- `errors.diagnosisAgeExceedsCurrentAge`
- `errors.glucoseRequiredForMetabolicProfile`
- `errors.imcThresholdCrossedUp`
- `errors.imcThresholdCrossedDown`

Replace hardcoded Spanish strings in `trackerStore.ts` lines 88, 115, 122-125, 134-136, 144-145, 167-170.

### Method Splits (planGenerator.ts)
```
buildDailyTemplate(restrictionActive, mealCount)
  ├─ ▶ buildMealSlots(mealCount)       → MealSlot[]
  ├─ ▶ assignFoodsToMeals(slots, foods) → MealEntry[]
  └─ ▶ enforceAOVE(entries, day)       → already extracted

generateWeeklyPlan(restrictionActive, mealCount)
  ├─ ▶ initializeWeekPlan() → { template, weeklySlots }
  └─ ▶ buildDayPlan(day, context) → DailyMeal
```

### Extract Sub-Components
`PlanView.tsx` → `src/features/recipe-engine/components/`:
- `CulturalBadges.tsx`
- `ZeroWasteBadges.tsx`

## Phase 4: Cleanup

| Change | File | Detail |
|--------|------|--------|
| Doc comment | `rationValidator.ts` | "validation" polysemy: ration rules (this file), `ValidationError` (form), `DailyViolations` (UI) |
| Doc comment | `errors.ts` | `ValidationError` usage context |
| Rename | `rationValidator.ts:107` | `emptyCounts` → `defaultRationCounts` |
| Rename consumers | `planGenerator.ts:9,62,282` | Update `emptyCounts` usage |

## File Changes by Phase

| Phase | New | Modified | Deleted |
|-------|-----|----------|---------|
| P1 | `shared/stores/planStore.ts` | `useExportData.ts`, `RecipeEngineContainer.tsx`, `storage.ts` | `features/recipe-engine/planStore.ts` (→ barrel) |
| P2 | `shared/services/profileService.ts`, `_headers` | `index.html`, `vite.config.ts`, `trackerStore.ts`, 7 Views + 7 Containers | — |
| P3 | 4 test files, 2 component files | 2 test files (getByTestId), 4 Views (rename), 4 Containers, `es.ts`, `en.ts`, `types.ts`, `planGenerator.ts` | 4 old View files (replaced by rename) |
| P4 | — | `rationValidator.ts`, `errors.ts`, `planGenerator.ts` | — |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `profileService` pure functions | TDD: write test → RED → GREEN → REFACTOR. No mocks |
| Unit | 4 new Container/View test files | AAA, getByRole, verify render + interaction |
| Unit | 13 getByTestId replacements | Verify equivalent assertions with accessible queries |
| Regression | Full suite | `pnpm quality` + `pnpm verify` — all 680 tests green at each phase boundary |
