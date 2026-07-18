# Tasks: H5 — Cultural Metadata UNESCO (FR-5.2)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~84 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Domain Schema

- [x] 1.1 Add `CulturalMetadataSchema` (Zod) in `src/shared/domain/food.ts` — 6 fields with defaults
- [x] 1.2 Add `culturalMetadata?: CulturalMetadataSchema.optional()` to `FoodSchema`
- [x] 1.3 Export `CulturalMetadataSchema` and `CulturalMetadata` type from `src/shared/domain/index.ts`

## Phase 2: Data Population

- [x] 2.1 Add `culturalMetadata` to lentejas, garbanzos, alubias (stew, social, traditional, erMedDiet)
- [x] 2.2 Add `culturalMetadata` to bacalao (traditional, erMedDiet, Atlántico Norte, proteinBioValue 92)
- [x] 2.3 Add `culturalMetadata` to sardinas (traditional, erMedDiet, Mediterráneo)
- [x] 2.4 Add `culturalMetadata` to AOVE (traditional, erMedDiet, Mediterráneo)

## Phase 3: UI Rendering

- [x] 3.1 Add `CulturalBadges` component in `src/features/recipe-engine/PlanView.tsx` — conditional 🏺👥🌿 with aria-labels
- [x] 3.2 Wire `<CulturalBadges>` inline after food name when `food.culturalMetadata` is present

## Phase 4: Testing & Verification

- [x] 4.1 Add test in `PlanView.test.tsx` — verify 3 badge types render with correct aria-labels
- [x] 4.2 Run `pnpm quality` — lint 0, typecheck clean, 273 tests passing
