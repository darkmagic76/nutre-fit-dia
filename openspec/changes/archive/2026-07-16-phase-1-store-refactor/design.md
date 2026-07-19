# Design: Phase 1 — God Store → Per-Feature Stores

## Technical Approach

Mechanical 3-strata refactor with zero behavioral change:

1. **Shared utils** — extract `sanitizeNumeric` → `src/shared/utils/sanitize.ts`, `computeIMC` → `src/shared/utils/imc.ts`, `CATEGORY_DISPLAY_NAMES` → `src/shared/domain/foodCategory.ts`
2. **Per-feature stores** — each `src/features/{feature}/store/{name}Store.ts` owns its state slice
3. **Container adapters** — replace `useAppStore((s) => s.x)` with the feature-specific hook

Cross-feature reads (logStore needs `restrictionActive` from trackerStore) use Zustand's `getState()` — safe, no data coupling, per ADR-009.

## Architecture Decisions

### Decision: Store file placement

| Option | Tradeoff |
|--------|----------|
| `src/features/{feature}/store/{name}Store.ts` | Screaming Architecture, co-located with feature container |
| `src/shared/stores/{name}Store.ts` | Centralized but violates ADR-001 (feature code in shared/) |

**Choice**: Feature directories per ADR-001 Scope Rule. Each store lives next to its container.

### Decision: Cross-feature reads via `getState()`

| Option | Tradeoff |
|--------|----------|
| Zustand `getState()` | Runtime coupling but no import cycle, no prop drilling |
| import + direct call | Creates compile-time dependency cycle |
| Prop drilling through App | Works but violates Container independence |

**Choice**: `getState()` — the only option that preserves compile-time isolation while allowing reads. Per ADR-009 spec.

### Decision: `setGender` validation strategy

| Option | Tradeoff |
|--------|----------|
| Zod schema parse in setter | Type-safe at runtime, consistent with ADR-002 |
| TypeScript type assertion | Unsafe — bypassed at runtime |
| HTML `select` constraint | Not sufficient — programmatic calls bypass |

**Choice**: Zod parse with catch/default, matching existing `FoodCategorySchema` pattern.

### Decision: `sanitizeNumeric` decimal fix

| Option | Tradeoff |
|--------|----------|
| Regex: `replace(/[^0-9.]/g, '').split('.').slice(0, 2).join('.')` | Simple, no new dependency |
| `Number()` with locale-aware parse | Over-engineered for local input |
| Keep current regex | Bug: allows "80.5.3" → NaN |

**Choice**: Split on `.` and keep first 2 segments. Minimal change, fixes the bug.

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  App.tsx (tab manager)                                   │
│    │                                                      │
│    ├── ScannerContainer ─── usesScannerStore()           │
│    ├── DailyLogContainer ── usesLogStore()               │
│    │                              │                       │
│    │                    reads restrictionActive ──────────┤  getState()
│    │                              │                       │
│    ├── MetabolicTracker ── usesTrackerStore()             │
│    └── PlanContainer ──── usesPlanStore()                 │
│                                                           │
│  shared/utils:                                            │
│    sanitize.ts ←── sanitizeNumeric(used by trackerStore)  │
│    imc.ts ←────── computeIMC(used by trackerStore)        │
│  shared/domain:                                           │
│    foodCategory.ts ←── CATEGORY_DISPLAY_NAMES             │
└──────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action |
|------|--------|
| `src/shared/store/appStore.ts` | Delete |
| `src/shared/utils/sanitize.ts` | Create |
| `src/shared/utils/imc.ts` | Create |
| `src/shared/domain/foodCategory.ts` | Modify — add DISPLAY_NAMES |
| `src/features/metabolic-tracker/store/trackerStore.ts` | Create |
| `src/features/med-diet-validator/store/logStore.ts` | Create |
| `src/features/recipe-engine/store/planStore.ts` | Create |
| `src/features/nutritional-traffic-light/store/scannerStore.ts` | Create |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.tsx` | Modify — import trackerStore |
| `src/features/med-diet-validator/DailyLogContainer.tsx` | Modify — import logStore, remove CATEGORY_NAMES |
| `src/features/recipe-engine/PlanContainer.tsx` | Modify — import planStore, remove CATEGORY_NAMES |
| `src/features/nutritional-traffic-light/ScannerContainer.tsx` | Modify — add addFoodToLog import change, remove CATEGORY_NAMES |
| `src/App.test.tsx` | Modify — update imports if needed |

## Interfaces / Contracts

```ts
// src/shared/utils/sanitize.ts
export function sanitizeNumeric(value: string, max: number, min = 0): number
export function sanitizeGender(value: string): 'male' | 'female'

// src/shared/utils/imc.ts
export function computeIMC(weightKg: number, heightCm: number): number
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (new) | sanitizeNumeric decimal fix | 2 edge cases: "80.5.3" → 80.5, "abc" → min |
| Unit (new) | computeIMC | 1 case: IMC(80, 170) = 27.7 |
| Integration (existing) | 68 existing tests | All MUST pass with no changes — store extraction is internal |

No behavioral changes needed — existing tests verify the same logic through the containers.

## Migration / Rollout

No migration required. Single PR/commit. The old `appStore.ts` is deleted atomically in the final commit after all containers are updated. No data to migrate — stores re-initialize from defaults.

## Open Questions

None.
