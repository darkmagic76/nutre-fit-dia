# Design: H4 — Dual Qualification Scanner

## Technical Approach

Extend two contracts with optional `environmentalScore` — one at the infra adapter layer (`ScanResult` in `infrastructure/ml/types.ts`) and one at the feature service layer (`ClassificationResult` in `classificationService.ts`). `classifyFoodWithReasons()` calls `computeEnvironmentalScore()` from the existing H3 shared module for non-RED results. RED-override paths (occult sugars, trans fats) return early before environmental scoring — no point computing sustainability for unsafe food.

## Architecture Decisions

### Decision: Dual-layer extension (infra + service)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extend only `ClassificationResult` | Cleaner — single touch point. But `ScanResult` is the scanner adapter contract (ADR-003); not extending it breaks the pipeline layer isolation. | **Extend both.** Each layer owns its contract. `ScanResult` documents scanner capability; `ClassificationResult` documents service capability. Either can be consumed independently. |
| Extend only `ScanResult` and let consumers read from it directly | Breaks consumer abstraction — ScannerContainer shouldn't reach into infra types for env data. | **Rejected.** Service layer must own the consumer-facing contract. |

### Decision: RED-override skips environmental score

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Compute env score unconditionally | Wasted computation — unsafe foods are RED regardless. | **Skip.** `classifyFoodWithReasons` returns early on occult sugars/trans fats, before `computeEnvironmentalScore` is reached. |
| Compute env score anyway and attach to RED | Downstream consumers might show misleading dual qualification on RED foods — "RED health but great environment" is dangerous UX. | **Rejected.** Dual qualification only makes sense for non-RED foods (GREEN/ORANGE). |

### Decision: `?` optional field for backward compatibility

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `environmentalScore?: EnvironmentalScore` | TypeScript `?` means existing destructuring (`const { foodId, color } = result`) compiles unchanged. | **Adopted.** Zero breakage. Existing 22 tests pass unmodified. |
| `environmentalScore: EnvironmentalScore \| undefined` | Same runtime behavior but forces explicit `| undefined` in type unions — stricter but noisier. Same backward-compat. | **Acceptable alternative.** Both work; `?` is idiomatic for optional field declarations. |

## Data Flow

```
ScannerAdapter.scan(input)
  │
  ▼
ScanResult { foodId, confidence, ingredients, detectedAddedSugars, environmentalScore? }
  │  ▲ environmentalScore set by adapter if carbonFootprint available
  │  └── optional — degrades gracefully when missing
  ▼
classifyFoodWithReasons(food)
  │
  ├── occult sugars? ──► RED (return early — NO env score)
  ├── trans fats?    ──► RED (return early — NO env score)
  └── GREEN/ORANGE   ──► computeEnvironmentalScore(food) ──► environmentalScore
                            │
                            ├── carbonFootprint available  → real score
                            └── carbonFootprint missing    → neutral carbon (0)
                                  │
                                  ▼
ClassificationResult { color, reasons, environmentalScore? }
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/infrastructure/ml/types.ts` | Modify | `ScanResult` gains `environmentalScore?: EnvironmentalScore` (imported from `@shared/sustainability`) |
| `src/features/nutritional-traffic-light/services/classificationService.ts` | Modify | `ClassificationResult` gains `environmentalScore?: EnvironmentalScore`; `classifyFoodWithReasons` imports `computeEnvironmentalScore` and calls it before returning GREEN/ORANGE |
| `src/features/nutritional-traffic-light/services/classificationService.test.ts` | Modify | 3 new H4 tests: with carbon, without carbon, health+env combined |

## Interfaces / Contracts

No new interfaces. Two existing interfaces gain an optional field:

```typescript
// src/infrastructure/ml/types.ts
export interface ScanResult {
  foodId: string
  confidence: number
  ingredients: string[]
  detectedAddedSugars: string[]
  environmentalScore?: EnvironmentalScore  // ← ADDED
}

// src/features/nutritional-traffic-light/services/classificationService.ts
export interface ClassificationResult {
  color: TrafficLightColor
  reasons: string[]
  environmentalScore?: EnvironmentalScore  // ← ADDED
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Food WITH carbonFootprint → `environmentalScore` defined | Verify carbon, seasonality, proximity, composite score |
| Unit | Food WITHOUT carbonFootprint → `environmentalScore` defined with neutral carbon | Verify carbon is 0, env score still present |
| Unit | RED-override foods → NO `environmentalScore` | Verify undefined (early return) |
| Unit | Health classification correctness preserved alongside env score | Verify color/reasons unchanged when env score is present |

No integration or E2E tests — this is a pure data transformation with no side effects or IO.

## Migration / Rollout

No migration required. Optional field means existing consumers see no difference. Deploy as part of normal feature release.

## Open Questions

*None.* Implementation is complete; this is a retroactive design document.
