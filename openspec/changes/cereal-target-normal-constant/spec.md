# Delta Spec: cereal-target-normal-constant

## Context

`planGenerator.ts` defines `CEREAL_DAILY_NORMAL = 5` as a module-scoped constant (line 26), duplicating a value that belongs in `clinical.ts` alongside `CEREAL_RESTRICTED_MAX = 4`. The value 5 is a legitimate midpoint of the AESAN 3-6 range, but it should be centralized as a named constant with an honest source attribution, not a magic number in an application service.

Additionally, `clinical-thresholds/spec.md` has two stale requirements:
1. Claims "14 thresholds" but `clinical.ts` exports 16 (NUTS were added later).
2. `REQ-VEGETABLE-NUDGE-REEXPORT` requires a re-export from `@shared/nudge/index.ts` — a barrel that was implicitly removed during `clean-architecture-layers` and has zero consumers today.

---

## ADDED Requirements

### Requirement: R1 — CEREAL_TARGET_NORMAL constant in clinical.ts

`src/domain/clinical.ts` MUST export `CEREAL_TARGET_NORMAL = 5` with the comment: `"Internal design decision — midpoint of AESAN 3-6 range for normal (non-restricted) daily cereal target"`.

#### Scenario: Constant is exported from clinical.ts

- GIVEN `clinical.ts`
- WHEN a consumer imports `CEREAL_TARGET_NORMAL` from `@domain/clinical`
- THEN the value SHALL be `5`

#### Scenario: Constant has honest source attribution

- GIVEN the `CEREAL_TARGET_NORMAL` declaration in `clinical.ts`
- THEN the JSDoc comment SHALL state "Internal design decision — midpoint of AESAN 3-6 range"

### Requirement: R2 — planGenerator imports CEREAL_TARGET_NORMAL from clinical.ts

`src/application/services/planGenerator.ts` MUST import `CEREAL_TARGET_NORMAL` from `@domain/clinical` and MUST NOT define a module-scoped `CEREAL_DAILY_NORMAL` constant.

#### Scenario: planGenerator uses centralized constant

- GIVEN `planGenerator.ts`
- WHEN `buildMealSlots` computes `cerealMax`
- THEN `cerealMax` SHALL resolve from the imported `CEREAL_TARGET_NORMAL` (value 5) when `caloricRestrictionActive` is false

#### Scenario: No module-scoped cereal constant in planGenerator

- GIVEN `planGenerator.ts`
- WHEN reviewing the file
- THEN there SHALL be zero `const CEREAL_DAILY_NORMAL` or similar module-scoped cereal constants

---

## MODIFIED Requirements

### Requirement: REQ-CLINICAL-CENTRALIZATION (clinical-thresholds/spec.md)

The scenario "all 14 thresholds are visible" SHALL be updated to "all 17 thresholds are visible" (16 existing + 1 new `CEREAL_TARGET_NORMAL`).

### Requirement: REQ-VEGETABLE-NUDGE-REEXPORT (clinical-thresholds/spec.md) — REMOVED

This requirement SHALL be deleted from `clinical-thresholds/spec.md`. The `@shared/nudge/index.ts` barrel was implicitly removed during `clean-architecture-layers` and has zero consumers. `VEGETABLE_NUDGE_HOUR_THRESHOLD` is imported directly from `@domain/clinical` by all current consumers.

---

## Constraints

- **No behavior change**: `CEREAL_TARGET_NORMAL` value is exactly 5, matching the current hardcoded value. Plans generated before and after this change are identical.
- **No test changes required**: The value is unchanged, so existing tests pass without modification.
- **Additive only**: One new export in `clinical.ts`, one import added in `planGenerator.ts`, one module-scoped constant removed.
