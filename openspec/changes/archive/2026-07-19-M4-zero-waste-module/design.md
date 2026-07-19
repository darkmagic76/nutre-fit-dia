# Design: M4 — Zero-Waste Module

## Technical Approach

Add two boolean flags to `FoodSchema` (isUglyProduce, isZeroWaste) with `.default(false)`, tag ~6 catalog items, and render inline emoji badges in `PlanView.tsx` following the same inline-component pattern as `CulturalBadges`. V1 is informational-only — no scoring, no filtering, no ScannerView integration.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Shared component in `@shared/ui/` vs inline in `PlanView.tsx` | Shared = reusable if 2+ features need badges. Inline = simpler, follows Scope Rule (1 consumer = local) | **Inline in PlanView** — only PlanView uses badges in V1 |
| Nested metadata object (like `CulturalMetadata`) vs direct fields on `FoodSchema` | Nested = group related flags. Direct = simpler access, no optional chaining | **Direct boolean fields** — zero-waste flags are not domain metadata, they're concrete food attributes |
| Two separate badge components vs single `ZeroWasteBadges` | Separate = clear separation. Single = less code duplication | **Single inline component** — both badges share the same container span and rendering pattern |

## Data Flow

```
FoodSchema (food.ts)                 PlanView.tsx
  ├─ isUglyProduce: boolean  ─────→  ZeroWasteBadges inline
  └─ isZeroWaste: boolean    ─────→   ├─ ♻️ "Zero Waste" (if isZeroWaste)
                                       └─ 🥕 "KM0" (if isUglyProduce)

foods-data.ts
  └─ ~6 items tagged with flags  →  parsed through food() factory → defaults applied
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/domain/food.ts` | Modify | Add `isUglyProduce` and `isZeroWaste` boolean fields with `.default(false)` |
| `src/shared/domain/index.ts` | Modify | Export new types from food.ts (automatic — no extra exports needed, Zod infers from schema) |
| `src/shared/data/foods-data.ts` | Modify | Tag ~6 items with zero-waste/ugly-produce flags |
| `src/features/recipe-engine/PlanView.tsx` | Modify | Add inline `ZeroWasteBadges` component + render beside `CulturalBadges` |
| `src/shared/domain/food.test.ts` | **New** | Schema validation tests for new fields |
| `src/features/recipe-engine/PlanView.test.tsx` | **New** | Badge rendering tests |

## Interfaces / Contracts

```typescript
// Added to FoodSchema in src/shared/domain/food.ts
isUglyProduce: z.boolean().default(false),
isZeroWaste: z.boolean().default(false),

// Inline component signature (inside PlanView.tsx)
function ZeroWasteBadges({ food }: { food: Food }): JSX.Element
```

**Flag semantics**:
- `isZeroWaste` = local AND seasonal AND unpackaged (superset of `isSeasonal`)
- `isUglyProduce` = cosmetic defects (odd shape, spots, etc.)

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Schema defaults default to `false` | Parse empty/partial input through `FoodSchema`, assert defaults |
| Unit | Known foods have correct flags | `food()` factory with explicit flags, assert parsed values |
| Unit | Backward-compatible: existing foods get `false` defaults | Parse existing food data (no new flags), assert `isUglyProduce === false` |
| Unit | Tagged foods in dataset carry expected flags | Parameterized test over tagged IDs against `foodsById` |
| Unit | Badge renders correct emoji for each flag | Render `ZeroWasteBadges` with each flag true, assert ♻️/🥕 in DOM |
| Unit | Badge renders nothing when both flags false | Assert empty output |

## Migration / Rollout

No migration required. Flags default to `false` — all existing foods get the new fields via Zod `.default()` with zero changes to stored data. New tagged items are additive.

## Open Questions

- [ ] Confirm exact set of foods to tag (proposal says ~6-8, user says ~6 — finalize list at task phase)
- [ ] Confirm ScannerView is truly out of scope for V1 (proposal included it, user narrowed to PlanView-only)
