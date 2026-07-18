# Design: H5 — Cultural Metadata UNESCO (FR-5.2)

## Technical Approach

Extend `FoodSchema` with an optional `CulturalMetadataSchema` (Zod) to tag traditional Mediterranean dishes with UNESCO cultural/social metadata. Render conditional badges (🏺👥🌿) inline in `PlanView` entry rows when metadata is present. Populate 6 traditional dishes in the default food dataset. Zero runtime cost for foods without metadata — optional field, `undefined` by default.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| **A — Separate Recipe type** | Cleaner domain separation, but new type + service + UI surface for V1 scope. Over-engineering. | ❌ Rejected |
| **B — Optional field on Food** | Backward-compatible, minimal surface area, one validation path. Metadata is a property of the food, not a distinct entity — correct semantic. | ✅ Chosen |
| **CulturalMetadata in domain vs infrastructure** | Cultural metadata **is** domain data (UNESCO labels on traditional preparations), not an external concern. Placing it in `shared/domain` matches the pattern of `FoodSchema`. | ✅ Domain (`food.ts`) |
| **CulturalBadges local vs shared** | Used by exactly 1 feature (recipe-engine/PlanView). Scope Rule demands local placement. Inline component avoids premature abstraction. | ✅ Local in `PlanView.tsx` |
| **Emoji + aria-label vs icon library** | Zero dependencies, screen-reader accessible via `aria-label`, trivial to swap for SVGs later. | ✅ Emoji + aria-label |

## Data Flow

```
FoodSchema.parse(input)
    │
    ├─ culturalMetadata present? ──yes──► CulturalMetadataSchema validates
    │                                           │
    │                                           ▼
    │                                   Food.culturalMetadata populated
    │
    └─ no culturalMetadata? ──► Food.culturalMetadata = undefined
                                        │
                                        ▼
PlanView renders entry row
    │
    ├─ food.culturalMetadata? ──yes──► <CulturalBadges meta={...} />
    │                                       │
    │                                       ├─ traditionalCuisine? → 🏺
    │                                       ├─ socialEating?       → 👥
    │                                       └─ erMedDiet?          → 🌿
    │
    └─ undefined? ──► nothing rendered
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/domain/food.ts` | Modify | Add `CulturalMetadataSchema` + `culturalMetadata` field on `FoodSchema` |
| `src/shared/domain/index.ts` | Modify | Export `CulturalMetadataSchema`, `CulturalMetadata` type |
| `src/shared/data/foods-data.ts` | Modify | Add `culturalMetadata` to 6 traditional dishes |
| `src/features/recipe-engine/PlanView.tsx` | Modify | Add `CulturalBadges` component + conditional rendering |
| `src/features/recipe-engine/PlanView.test.tsx` | Modify | Add test for badge rendering with aria-labels |

## Interfaces / Contracts

```typescript
// CulturalMetadataSchema (Zod) — in shared/domain/food.ts
export const CulturalMetadataSchema = z.object({
  traditionalCuisine: z.boolean().default(false),
  socialEating:       z.boolean().default(false),
  cookingTechnique:   z.enum(['steam','boiled','grilled','raw','stew']).optional(),
  geographicOrigin:   z.string().optional(),
  proteinBiologicalValue: z.number().min(0).max(100).optional(),
  erMedDiet:          z.boolean().default(false),
})
export type CulturalMetadata = z.infer<typeof CulturalMetadataSchema>

// On FoodSchema:
culturalMetadata: CulturalMetadataSchema.optional()
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | CulturalMetadataSchema validation | Zod schema tests (3 scenarios from spec) |
| Unit | FoodSchema backward-compat | Foods with/without `culturalMetadata` parse correctly |
| Unit | Badge rendering | Render `PlanView` with `lentejas` food factory → assert 3 aria-labels |
| Integration | All 6 dishes carry metadata | Dataset assertion — query each dish metadata |
| Integration | Non-cultural foods stay clean | Random raw ingredients have `undefined` metadata |

## Migration / Rollout

No migration required. Optional field — existing foods are unchanged. Additive change with no breaking impact.

## Open Questions

- None. All design decisions were resolved during implementation.
