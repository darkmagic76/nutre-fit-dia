# Normalize Domain Imports Specification

## Purpose

Eliminate cross-layer barrel files (`@shared/domain`, `@shared/nudge`) by replacing all imports with direct `@domain/*` paths. This enforces the dependency rule: shared layer must not re-export domain types.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | No file may import from `@shared/domain` | MUST |
| R2 | No file may import from `@shared/nudge` or `@shared/nudge/*` | MUST |
| R3 | All domain imports resolve via `@domain/*` aliases | MUST |
| R4 | Barrel files `src/shared/domain/index.ts`, `src/shared/nudge/index.ts`, `src/shared/nudge/engine.ts`, `src/shared/nudge/types.ts` MUST be deleted | MUST |
| R5 | All existing tests pass without modification to test logic | MUST |
| R6 | TypeScript compilation succeeds with zero errors | MUST |

### R1: No @shared/domain imports

After migration, grep for `from ['"]@shared/domain` across `src/` returns zero matches.

#### Scenario: Zero @shared/domain references

- GIVEN the migration is complete
- WHEN running `grep -r "from ['\"]@shared/domain" src/`
- THEN the result is empty (no matches)

### R2: No @shared/nudge imports

After migration, grep for `from ['"]@shared/nudge` across `src/` returns zero matches.

#### Scenario: Zero @shared/nudge references

- GIVEN the migration is complete
- WHEN running `grep -r "from ['\"]@shared/nudge" src/`
- THEN the result is empty (no matches)

### R3: Direct @domain/* imports

Every type previously imported from `@shared/domain` or `@shared/nudge` is now imported from its canonical `@domain/*` module.

#### Scenario: Domain types resolve from @domain modules

- GIVEN a file needs `Food`, `FoodCategory`, `SystemNotification`, `CooldownTracker`, `NudgeContext`, or `SafetyRule`
- WHEN the import statement is inspected
- THEN it imports from `@domain/food`, `@domain/foodCategory`, `@domain/notification`, `@domain/cooldownTracker`, `@domain/nudgeContext`, `@domain/nudgeTypes`, or `@domain/index` — never from `@shared/*`

#### Import mapping table

| Old import | New import |
|---|---|
| `@shared/domain` → `Food`, `FoodCategory`, `TrafficLightColor`, `CulturalMetadata` | `@domain/food`, `@domain/foodCategory`, `@domain/trafficLight` |
| `@shared/domain` → `SystemNotification`, `NotificationType`, `NotificationSeverity` | `@domain/notification` |
| `@shared/domain` → `ActivityEntry` | `@domain/activity` |
| `@shared/domain` → `food` (catalog) | `@domain/food` |
| `@shared/nudge` → `CooldownTracker`, `CooldownOps` | `@domain/cooldownTracker` |
| `@shared/nudge` → `NudgeContext`, `ContextInput` | `@domain/nudgeContext` |
| `@shared/nudge` → `NudgeRule`, `SafetyRule`, `NudgeEvaluation` | `@domain/nudgeTypes` |
| `@shared/nudge/engine` → `buildNudgeContext`, `evaluateRules` | `@domain/nudgeContextBuilder`, `@domain/nudgeEvaluator` |
| `@shared/nudge/types` → `ContextInput`, `NudgeContext`, `NudgeRule`, `SafetyRule`, `NudgeEvaluation` | `@domain/nudgeContext`, `@domain/nudgeTypes` |

### R4: Barrel files deleted

The four cross-layer barrel files no longer exist.

#### Scenario: Barrel files removed

- GIVEN the migration is complete
- WHEN checking file existence
- THEN `src/shared/domain/index.ts`, `src/shared/nudge/index.ts`, `src/shared/nudge/engine.ts`, `src/shared/nudge/types.ts` do NOT exist

### R5: Tests pass

All unit and component tests pass with identical behavior.

#### Scenario: Full test suite green

- GIVEN the migration is complete
- WHEN running `pnpm test:run`
- THEN all tests pass with exit code 0

### R6: TypeScript compilation

The project compiles without type errors.

#### Scenario: Zero type errors

- GIVEN the migration is complete
- WHEN running `npx tsc --noEmit`
- THEN exit code is 0 and stderr contains no errors
