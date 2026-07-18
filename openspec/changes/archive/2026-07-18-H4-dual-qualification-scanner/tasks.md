# Tasks: H4 — Dual Qualification Scanner

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~30–50 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No  
Chained PRs recommended: No  
Chain strategy: size-exception  
400-line budget risk: Low  

## Phase 1: Contract Extension (Types)

- [x] 1.1 Import `EnvironmentalScore` from `@shared/sustainability` in `src/infrastructure/ml/types.ts`
- [x] 1.2 Add `environmentalScore?: EnvironmentalScore` to `ScanResult` interface

## Phase 2: Service Integration

- [x] 2.1 Import `computeEnvironmentalScore` and `EnvironmentalScore` type in `src/features/nutritional-traffic-light/services/classificationService.ts`
- [x] 2.2 Add `environmentalScore?: EnvironmentalScore` to `ClassificationResult` interface
- [x] 2.3 Call `computeEnvironmentalScore(food)` in `classifyFoodWithReasons()` — only for non-RED paths (after early returns)

## Phase 3: Testing

- [x] 3.1 Test: food WITH `carbonFootprint` — verify `environmentalScore` has carbon, seasonality, proximity, composite score
- [x] 3.2 Test: food WITHOUT `carbonFootprint` — verify `environmentalScore` exists with neutral carbon (0)
- [x] 3.3 Test: RED-override (occult sugars, trans fats) — verify `environmentalScore` is undefined

## Phase 4: Verification

- [x] 4.1 Run `pnpm quality` — lint 0, typecheck clean, all 22 + 3 = 25 tests passing
