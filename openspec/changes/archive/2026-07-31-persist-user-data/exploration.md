# Exploration: persist-user-data

## Current State — The Persistence Gap

Every Zustand store creates state at line ~14 with `create(...)` — zero configuration,
pure in-memory. Page refresh = complete data loss.

### 1. trackerStore — metabolic profile

| Aspect | Detail |
|---|---|
| **File** | `src/shared/stores/trackerStore.ts` |
| **create()** | Line 60 — `create<TrackerState>((set, get) => ({...}))` |
| **Data held** | `weight`, `height`, `age`, `diagnosisAge`, `gender`, `paf`, `glucose`, `glucoseContext`, `caloricTarget` (derived), `restrictionActive`, `profileError` |
| **Loss impact** | User must re-enter ALL metabolic data. Caloric target recomputed. Glucose reading re-recorded in biomarker history. |
| **Size** | ~10 scalar fields + 1 computed object |

### 2. logStore — daily food log

| Aspect | Detail |
|---|---|
| **File** | `src/shared/stores/logStore.ts` |
| **create()** | Line 24 — `create<LogState>((set, get) => ({...}))` |
| **Data held** | `todayLog: Food[]`, `todayValidation: ValidationResult \| null` |
| **Loss impact** | Entire day's food log erased. Validation result lost. User re-enters meals from zero. |
| **Size** | Array of `Food` objects (variable, potentially dozens per day) |

### 3. nudgeStore — notification history

| Aspect | Detail |
|---|---|
| **File** | `src/shared/stores/nudgeStore.ts` |
| **create()** | Line 14 — `create<NudgeState>((set) => ({...}))` |
| **Data held** | `pending: SystemNotification[]`, `history: SystemNotification[]` (with `acknowledgedAt`/`dismissedAt`) |
| **Loss impact** | All nudge history erased. Acknowledged nudges re-appear. Behavioral tracking reset. |
| **Size** | Small — typically < 100 notifications |

### 4. activityStore — activity tracking

| Aspect | Detail |
|---|---|
| **File** | `src/shared/stores/activityStore.ts` |
| **create()** | Line 18 — `create<ActivityState>((set) => ({...}))` |
| **Data held** | `weeklyMinutes`, `strengthSessions`, `entries: ActivityEntry[]`, `streak` |
| **Loss impact** | Streak counter resets to 0. All activity entries lost. Compliance incentive destroyed. |
| **Size** | Moderate — `entries` can grow weekly |

### 5. planStore — weekly meal plan

| Aspect | Detail |
|---|---|
| **File** | `src/features/recipe-engine/planStore.ts` |
| **create()** | Line 11 — `create<PlanState>((set) => ({...}))` |
| **Data held** | `weeklyPlan: WeeklyPlan \| null` |
| **Loss impact** | Generated 7-day meal plan is gone. Must regenerate. May differ because food selection uses `day % options.length` and depends on current day. |
| **Size** | Large — 7 days × meal entries in each, can be hundreds of `MealEntry` objects |

### Summary — 5 stores, zero persistence

```
useTrackerStore  → in-memory only  → profile lost on refresh ✓
useLogStore      → in-memory only  → food log lost on refresh ✓
useNudgeStore    → in-memory only  → nudge history lost       ✓
useActivityStore → in-memory only  → streak reset on refresh  ✓
usePlanStore     → in-memory only  → plan lost on refresh     ✓
```

---

## Biomarker History Emergency

**File**: `src/shared/services/biomarkerTrackingService.ts`

Lines 4-5 define **module-level mutable arrays**:

```typescript
const glucoseHistory: GlucoseReading[] = [];
const weightHistory: WeightReading[] = [];
```

These are NOT in any Zustand store. They are invisible to any persistence strategy. They survive only as long as the JavaScript module retains its reference — which is during the SPA session. On page refresh, the module re-evaluates and arrays start empty.

**Functions that depend on these arrays**:
- `recordGlucose(reading)` — push to `glucoseHistory` (line 11)
- `recordWeight(kg, cm)` — push to `weightHistory` (line 24)
- `getTrend()` — computes trends from both arrays (line 32)
- `detectIMCThresholdCrossing()` — reads last 2 weight entries (line 76)
- `resetBiomarkerHistory()` — test-only reset (line 88)

**Impact**: `trackerStore.calculateTarget()` calls `recordGlucose()` and `recordWeight()` at lines 145 and 159. Every time the user calculates their target, data gets pushed into module arrays. Trends are computed from these arrays. If the store were persisted but these arrays were not, biomarkers would show a gap between persisted store data and in-memory-only history.

**WHAT MUST HAPPEN**: A new `biomarkerStore.ts` in `shared/stores/` that holds `glucoseHistory` and `weightHistory`. The service functions should be refactored to operate on store data instead of module-level arrays, OR the store should hydrate the arrays from localStorage on load.

---

## Zustand Persist API

**Installed**: `zustand@5.0.14` (package.json shows 5.0.14; config.yaml says 5.0.8 — minor installed ahead)

**The API** (from `node_modules/zustand/middleware/persist.d.ts`):

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'store-key',        // REQUIRED — unique localStorage key
      storage: createJSONStorage(() => localStorage),  // default
      version: 1,               // optional — migration support
      partialize: (state) => {  // optional — pick what to persist
        const { actions, ...persisted } = state;
        return persisted;
      },
      merge: (persisted, current) => ({ ...current, ...persisted }), // default
      migrate: (persisted, version) => { /* migration logic */ },
      onRehydrateStorage: () => (state, error) => { /* hydration callback */ },
      skipHydration: false,     // optional — SSR
    },
  ),
);
```

**Key types**:
- `PersistOptions<S, PersistedState>` — `name` (required), `storage` (optional, defaults to `localStorage` via `createJSONStorage`)
- `createJSONStorage(getStorage)` — wraps any `{ getItem, setItem, removeItem }` with JSON serialization
- `persist` mutator — adds `.persist` property to store with `clearStorage()`, `rehydrate()`, `hasHydrated()`, `onHydrate()`, `onFinishHydration()`, `getOptions()`, `setOptions()`

**How it works**: Zustand `persist` serializes state to JSON and writes to `localStorage`. On initialization, it reads back and hydrates the store. `partialize` lets you exclude actions (functions can't be serialized anyway — Zustand handles this automatically). `version` + `migrate` handle schema evolution.

**Important for testing**: The `persist` middleware writes/reads from `localStorage` by default. In Vitest/jsdom, localStorage is available but must be cleaned between tests. Tests that call `getState()` / `setState()` directly on the store still work — `setState()` bypasses persist. However, tests that use store hooks or create stores will trigger hydration reads. Best practice: mock or clear localStorage in `beforeEach`.

---

## Cooldown + Locale + Tab

### CooldownTracker (`src/shared/nudge/cooldownTracker.ts`)

- `Map<string, number>` in memory — maps rule IDs to registration timestamps
- Created fresh per nudge evaluation cycle: `new CooldownTracker(() => 0)`
- **Not** a singleton — it's instantiated in tests and in the nudge engine
- The nudge engine at `src/shared/nudge/engine.ts` evaluates rules and uses cooldown to prevent repeat nudges
- Persisting cooldowns means: the user dismissed a nudge → refresh → the nudge should NOT reappear until cooldown expires
- **Recommendation**: Move cooldown state (`Map<string, number>`) into `nudgeStore`. Persist it alongside nudge data. Test: cooldown timestamps persist across hydration cycles.

### Locale (`src/shared/i18n/I18nContext.tsx`)

- `useState<Locale>('es')` in `I18nProvider`
- On refresh, resets to Spanish
- **Impact**: Non-Spanish-speaking users must switch language on every load
- **Recommendation**: Read/write locale to `localStorage.getItem('locale')` in a `useEffect`, or lift locale into a Zustand store with persist. Second option is cleaner: create a small `uiStore` or add to an existing shared store.

### Tab state (`src/shared/hooks/useTabNavigation.ts`)

- `useState<Tab>('scanner')` in `useTabNavigation`
- On refresh, always lands on scanner tab
- **Impact**: Minor UX friction — user returns to the app and must re-navigate
- **Recommendation**: Use `sessionStorage` instead of `localStorage` for tab (session-level is appropriate since tab state is transient), or persist as part of `uiStore`

---

## Export Strategy

**Search for export/download mechanisms**: Zero results for `download`, `blob`, `FileSaver`, `saveAs`, `exportData`, `createObjectURL`. No export functionality exists anywhere in the codebase.

**What a minimal JSON export looks like**:

```typescript
function exportAllData(): string {
  return JSON.stringify(
    {
      tracker: useTrackerStore.getState(),
      log: useLogStore.getState(),
      nudge: useNudgeStore.getState(),
      activity: useActivityStore.getState(),
      plan: usePlanStore.getState(),
      biomarkerHistory: getBiomarkerHistory(),   // from new biomarkerStore
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
```

**Data weights** (estimated):
- Tracker profile: ~500 bytes JSON
- Food log (50 items): ~15 KB
- Nudge history (100 items): ~30 KB
- Activity entries (30 items): ~5 KB
- Weekly plan: ~20 KB
- Biomarker history (365 glucose + 52 weight): ~15 KB
- **Total**: ~85 KB uncompressed — well under localStorage's 5 MB limit

**Import (restore)**: Read JSON file, validate schema, call `setState()` on each store. This is separate from `localStorage` persistence — export/import is for user-controlled backup.

**Recommendation**: Ship persistence FIRST (phase 1), then add export/import as a separate, lower-priority feature (phase 2). Export is not a blocker for MVP persistence.

---

## Test Impact Assessment

### Direct store access patterns in tests

Every test file accesses stores via direct `getState()` / `setState()` calls — NOT via React hooks:

| Test file | Store access count | Pattern |
|---|---|---|
| `trackerStore.test.ts` | ~40+ calls | `useTrackerStore.getState().setWeight(...)`, `useTrackerStore.getState()` |
| `logStore.test.ts` | 14 calls | `useLogStore.setState({...})`, `.getState()` |
| `nudgeStore.test.ts` | ~25 calls | `useNudgeStore.getState().enqueue(...)`, `.getState()` |
| `planStore.test.ts` | 10 calls | `usePlanStore.setState({...})`, `.getState()` |
| `engine.test.ts` (nudge-engine) | 6 calls | `useTrackerStore.setState(...)`, `useLogStore.setState(...)` |

**Total**: 5 test files, ~95+ direct store accesses.

### Will `persist` middleware break existing tests?

**Short answer**: NO — if handled correctly. Here's why:

1. `persist` middleware uses `createJSONStorage(() => localStorage)` by default. Vitest with jsdom provides `localStorage` (it's part of the jsdom environment).
2. `getState()` and `setState()` work on the **in-memory store directly**. `setState()` does NOT write to localStorage — only state mutations that flow through the store's `set` function trigger persist writes.
3. The hydration happens **on store creation**, not on every access.

**What CAN break**:

| Risk | Detail | Mitigation |
|---|---|---|
| **Stale persisted data** | If localStorage has data from a previous test run, the store might hydrate with unexpected values | Call `localStorage.clear()` in `beforeEach` of each store test suite |
| **Cross-test contamination** | Test A sets store state, Test B reads stale persisted data | Same — `beforeEach` must clear both: `useXxxStore.setState(defaults)` + `localStorage.removeItem('store-key')` |
| **Async hydration** | `persist` hydrates asynchronously if `createJSONStorage` returns promises (it doesn't by default) | Default storage is sync for localStorage. No async issue. |
| **Partialize filter** | Functions/actions are auto-filtered from persist. Tests that mock functions on state are unaffected. | No action needed |

**Recommended test pattern**:

```typescript
import { beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  useTrackerStore.setState({
    weight: '80',
    height: '170',
    // ... all defaults
  });
});
```

This pattern is already largely followed: `logStore.test.ts` line 22 calls `useLogStore.setState({ todayLog: [], todayValidation: null })` and `trackerStore.test.ts` calls `resetBiomarkerHistory()`. Only need to add `localStorage.clear()`.

**No test currently tests persistence behavior** (e.g., "state survives store re-creation" or "hydration restores previous state"). Adding persist middleware doesn't break existing tests as long as `localStorage` is cleared.

### Test files that need attention

| File | Action required |
|---|---|
| `src/shared/stores/trackerStore.test.ts` | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/stores/logStore.test.ts` | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/stores/nudgeStore.test.ts` | Add `localStorage.clear()` in `beforeEach` |
| `src/shared/stores/activityStore.test.ts` | **(NO TEST FILE EXISTS)** — needs creation |
| `src/features/recipe-engine/planStore.test.ts` | Add `localStorage.clear()` in `beforeEach` |
| `src/features/nudge-engine/engine.test.ts` | No direct store change — only uses `.setState()` — but needs `localStorage.clear()` if it creates stores |
| `src/shared/services/biomarkerTrackingService.test.ts` | Likely uses `resetBiomarkerHistory()` — this will need to hydrate from store instead |

---

## Approaches

### Approach 1: Zustand persist middleware only (RECOMMENDED)

Add `persist` middleware to each store with `partialize` to strip non-serializable fields (like class instances, though these stores use plain objects).

**What changes per store**:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({ /* existing code */ }),
    {
      name: 'nutrifit-tracker',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
```

| Pros | Cons |
|---|---|
| Minimal code change — ~4 lines per store | No migration path for module-level biomarker arrays |
| Uses native Zustand API — no new dependencies | Cooldown tracker needs refactoring |
| Tests need only `localStorage.clear()` | |
| `partialize` auto-filters functions | |
| `version` + `migrate` for future schema evolution | |
| ~1 day implementation for all 5 stores | |

**Effort**: Low/Medium

### Approach 2: Approach 1 + biomarkerStore + cooldown integration

Everything from Approach 1, plus:
- Create `src/shared/stores/biomarkerStore.ts` — hold `glucoseHistory: GlucoseReading[]` and `weightHistory: WeightReading[]`
- Refactor `biomarkerTrackingService.ts` — functions operate on the store instead of module arrays, OR the module arrays are hydrated from the store on startup
- Move cooldown `Map<string, number>` into `nudgeStore` as `cooldowns: Record<string, number>` (Zustand can't persist `Map` directly)

| Pros | Cons |
|---|---|
| Solves the biomarker crisis | More files changed |
| Cooldown persistence = nudges respect dismissal across refresh | Breaks `resetBiomarkerHistory()` test helper — needs store-based reset |
| Complete persistence story | |

**Effort**: Medium

### Approach 3: Full persistence + export + locale/tab

Approach 2 plus:
- Create `src/shared/stores/uiStore.ts` — persist `locale: Locale` and `activeTab: Tab` (or use `sessionStorage` for tab)
- Build export/import utility in `src/shared/services/exportService.ts`

| Pros | Cons |
|---|---|
| Complete data persistence | Export/import adds scope and testing burden |
| Language selection survives refresh | Tab in sessionStorage is debatable — transient UX state |
| Full offline-first experience | |

**Effort**: High

---

## Recommendation

**Implement Approach 2 — Zustand persist middleware + biomarkerStore + cooldown integration**.

Rationale:
1. The biomarker history arrays are the most critical invisible data loss — they MUST be moved into a store before or alongside store persistence. If we persist the 5 stores but not the biomarker history, we still lose trend data on refresh.
2. Adding `persist` middleware to each store is ~4 lines per store. The bulk of the work is the biomarker store creation and the cooldown refactor.
3. Approach 2 provides a COMPLETE persistence solution. The user can refresh and lose NOTHING.
4. Export/import and locale/tab are important but lower priority — they can ship as follow-up changes.

**Implementation order**:
1. Create `biomarkerStore` with `glucoseHistory` and `weightHistory` — persist it
2. Refactor `biomarkerTrackingService` to use the store
3. Add `persist` to `trackerStore`, `logStore`, `nudgeStore`, `activityStore`, `planStore`
4. Move cooldown `Map` into `nudgeStore`
5. Update `shared/stores/index.ts` — export new stores
6. Update tests — add `localStorage.clear()` in `beforeEach`

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **localStorage quota exceeded** — daily food logs with large entries could accumulate | Low | 5 MB limit, estimated data < 100 KB. Monitor via `navigator.storage.estimate()` in production. |
| **Schema evolution** — adding/removing store fields causes stale data | Low | Use `version` + `migrate` API from the start (version: 1) |
| **PWA sync complexity** — ServiceWorker might need access to persisted data | Low | localStorage is accessible from ServiceWorker. No architectural change needed. |
| **Test flakiness** — localStorage contamination between suites | Low | `beforeEach` with `localStorage.clear()` in every store test suite is sufficient |
| **Cooldown timestamps desync** — persisted timestamps may be in the future or past after browser clock changes | Low | Treat cooldown as best-effort — stale entries are harmless (just block nudges for max cooldown duration) |
| **planStore size** — WeeklyPlan can be large (7 days × many entries) | Low | `partialize` is not needed for size — JSON.stringify handles it. Keep in localStorage. |

---

## Ready for Proposal

**Yes**. The exploration is complete:

- All 5 stores are pure in-memory with no persistence
- Biomarker history arrays are module-level and invisible to persistence
- Zustand 5 `persist` middleware is the right tool — zero additional dependencies
- Existing tests will work with minimal changes (`localStorage.clear()` in `beforeEach`)
- ~95 direct store accesses in tests, none should break
- Implementation is low-risk and well-understood

The orchestrator should launch `sdd-propose` for `persist-user-data` with the recommendation to implement Approach 2.
