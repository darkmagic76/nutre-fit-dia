# Proposal: H5 — Cultural Metadata UNESCO (FR-5.2)

## Intent

FR-5.2 requires tagging traditional Mediterranean preparations with UNESCO cultural/social metadata to promote emotional wellbeing and adherence. Raw ingredients need no tags — only dishes with cultural significance. Badges in the plan view give users immediate visibility of the Mediterranean lifestyle dimension.

## Scope

### In Scope
- `CulturalMetadataSchema` (Zod) as optional field on `Food`
- Population of 6 traditional dishes with UNESCO metadata
- `CulturalBadges` component inline in `PlanView` (🏺👥🌿)
- 1 test verifying badges render with correct aria-labels

### Out of Scope
- Separate Recipe type with cultural metadata (over-engineering for V1)
- Cooking technique recommendations or prep guides (M3 — deferred)
- Geographic origin filtering or search

## Capabilities

### New Capabilities
- `cultural-metadata`: UNESCO cultural/social metadata on traditional food preparations — Zod schema, domain types, population data, and inline badges in plan view

### Modified Capabilities
- None

## Approach

1. Extend `FoodSchema` with `culturalMetadata?: CulturalMetadataSchema` — optional, so existing foods are unaffected
2. Export `CulturalMetadataSchema` + `CulturalMetadata` type from domain index
3. Populate 6 traditional dishes (lentejas, garbanzos, alubias, bacalao, sardinas, AOVE) with relevant flags
4. Add `CulturalBadges` presentational component in `PlanView.tsx` — renders conditionally when `food.culturalMetadata` is present
5. Test uses `food()` factory with metadata, asserts `getByLabelText` for each badge

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/domain/food.ts` | Modified | Added `CulturalMetadataSchema` + field on `FoodSchema` |
| `src/shared/domain/index.ts` | Modified | Exported `CulturalMetadataSchema`, `CulturalMetadata` |
| `src/shared/data/foods-data.ts` | Modified | 6 dishes with `culturalMetadata` |
| `src/features/recipe-engine/PlanView.tsx` | Modified | Added `CulturalBadges` component |
| `src/features/recipe-engine/PlanView.test.tsx` | Modified | 1 test for badge rendering |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Badge aria-labels not descriptive enough for screen readers | Low | Use Spanish aria-labels matching UNESCO concepts |

## Rollback Plan

Remove `culturalMetadata` field from `FoodSchema`, delete `CulturalBadges` component from `PlanView.tsx`, revert `foods-data.ts` additions. All other code is unchanged.

## Dependencies

- None (standalone feature)

## Success Criteria

- [ ] `CulturalMetadataSchema` validates all 6 fields with correct defaults
- [ ] 6 traditional dishes carry UNESCO metadata
- [ ] Badges render conditionally in PlanView when metadata present
- [ ] Foods without `culturalMetadata` show no badges
- [ ] Test passes with correct aria-labels for all 3 badge types
