# Design: H3 — Sustainability Scoring Core

## Technical Approach

V1 simplified weighted composite scoring per ADR-007. Pure function `computeEnvironmentalScore(food)` maps `Food` → `EnvironmentalScore` using three dimensions (carbon 50%, seasonality 30%, proximity 20%) sourced from AESAN 2022 / EAT-Lancet reference data. Packaging and water footprint defaulted (V2). Module lives in `shared/sustainability/` and is consumed via `@shared/sustainability` barrel.

## Architecture Decisions

### Decision: Module placement — `shared/sustainability/`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Embedded in each feature | Duplicated scoring logic across 4+ consumers | ❌ Rejected |
| `shared/sustainability/` | Single source of truth, Scope Rule compliant (used by Scanner, RecipeEngine, NudgeEngine, MealPlan) | ✅ Chosen per ADR-007 |

**Rationale**: ADR-001 Scope Rule enforces: used by 2+ features → shared. Sustainability scoring is consumed by four features, so shared placement is mandatory.

### Decision: V1 carbon footprint as primitive `number`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Full `CarbonFootprint` value object | More precise but premature — no source data for sub-fields (production, transport, packaging phases) | ❌ Deferred to V2 |
| Primitive `number` on `Food` | Maps directly to AESAN thresholds, zero data friction | ✅ Chosen |

**Rationale**: Until Scanner provides phase-level carbon data, a single `number` (kg CO₂eq/kg) is the correct abstraction level.

### Decision: Proximity inferred from seasonality

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Independent proximity field on Food | More accurate but no data source in V1 | ❌ Rejected |
| `isSeasonal → km0`, `!isSeasonal → national` | Simplifies data model, reasonable heuristic | ✅ Chosen |

**Rationale**: Seasonal produce is locally available by nature. Proximity becomes an independent field when sourcing data is available (V2).

### Decision: Pure function, zero dependencies

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Class-based service with DI | Over-engineered for a stateless computation | ❌ Rejected |
| Exported pure function | Testable without mocks, tree-shakeable, no DI ceremony | ✅ Chosen |

**Rationale**: `computeEnvironmentalScore` is deterministic — same Food always yields same score. A class adds ceremony without benefit.

## Data Flow

```
Food (from planGenerator.foods[])
  │
  ▼
computeEnvironmentalScore(food)
  │  ├─ carbonFootprint  ──→ categorizeCarbon() ──→ carbonScore × 0.50
  │  ├─ isSeasonal (true) ──→ in_season (100)    × 0.30
  │  │              (false) ──→ out_of_season (30) × 0.30
  │  └─ isSeasonal ──→ proximity inference ──→ km0/national × 0.20
  │
  ▼
EnvironmentalScore { score, carbonFootprint, waterFootprint:0,
                      seasonality, proximity, packaging: BULK }
  │
  ▼
pickSustainableFood() in planGenerator.ts
  └─ .sort((a,b) => score(b) - score(a)) → foods ranked descending
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/sustainability/types.ts` | Create | Domain enums (Seasonality, Proximity, PackagingLevel) + EnvironmentalScore interface |
| `src/shared/sustainability/constants.ts` | Create | AESAN/EAT-Lancet reference data: ratios, thresholds, category scores, weights, seasonality/proximity mappings — all `as const` |
| `src/shared/sustainability/scoringService.ts` | Create | `computeEnvironmentalScore(food)`: pure function, weighted composite algorithm |
| `src/shared/sustainability/scoringService.test.ts` | Create | 14 unit tests covering all dimensions (TDD: RED → GREEN) |
| `src/shared/sustainability/index.ts` | Create | Barrel exports: types, constants, scoring service |
| `src/features/recipe-engine/services/planGenerator.ts` | Modify | `pickFood` → `pickSustainableFood`: sorts candidates by environmental score descending |

## Interfaces / Contracts

```typescript
// Types consumed by 4+ features
export interface EnvironmentalScore {
  carbonFootprint: number   // kg CO₂eq/kg
  waterFootprint: number    // L/kg (V1: always 0)
  seasonality: Seasonality  // IN_SEASON | GREENHOUSE | OUT_OF_SEASON
  proximity: Proximity      // LOCAL_KM0 | NATIONAL | IMPORTED
  packaging: PackagingLevel // BULK | RECYCLABLE | SINGLE_USE
  score: number             // 0–100 composite
}

// Public API — single entry point
export function computeEnvironmentalScore(food: Food): EnvironmentalScore
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Carbon categorization (5 tiers + unknown) | Parametrized: threshold boundaries + undefined |
| Unit | Seasonality mapping | True → IN_SEASON, False → OUT_OF_SEASON |
| Unit | Proximity inference | Seasonal → km0, non-seasonal → national |
| Unit | Composite score extremes | Best case ≥ 80, worst case ≤ 40 |
| Unit | V1 defaults | packaging=BULK, waterFootprint=0 |
| Unit | Food factory composability | All tests use `food()` from `@shared/domain` — no mocking |

## Migration / Rollout

No migration required. Independent module with zero external dependencies. Integration in `planGenerator.ts` is an internal sort change — no persisted state, no API contract change.

## Open Questions

- [ ] None — implementation is complete and verified (14/14 tests ✅)
