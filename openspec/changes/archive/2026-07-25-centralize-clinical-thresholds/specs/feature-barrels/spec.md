# Feature Barrels Specification

## Purpose

Establish the barrel export pattern for feature directories. Each feature's `index.ts` re-exports its Container component, enabling clean barrel imports from `@features/<name>` in App.tsx.

## Requirements

### REQ-BARREL-CONTAINER-EXPORT

Every feature directory under `src/features/` MUST export its Container component via `index.ts`. Consumers SHALL import as `import { XContainer } from '@features/<name>'`.

#### Scenario: Barrel import resolves

- GIVEN `@features/nutritional-traffic-light/index.ts` exports NutritionalTrafficLightContainer
- WHEN App.tsx runs `import { NutritionalTrafficLightContainer } from '@features/nutritional-traffic-light'`
- THEN TypeScript resolves the import at compile time

### REQ-BARREL-MISSING-FEATURES

The following feature directories MUST receive new `index.ts` barrels:

| Feature | Container to export |
|---|---|
| nutritional-traffic-light | NutritionalTrafficLightContainer |
| med-diet-validator | MedDietValidatorContainer |
| metabolic-tracker | MetabolicTrackerContainer |
| recipe-engine | RecipeEngineContainer |
| sustainability | SustainabilityContainer |

Barrel files SHALL export the Container only — no hooks, services, or types.

### REQ-BARREL-NUDGE-ENGINE

`src/features/nudge-engine/index.ts` MUST additionally export `NudgeEngineContainer`. The existing hooks/services re-exports MUST be preserved.

#### Scenario: NudgeEngineContainer joinable via barrel

- GIVEN nudge-engine/index.ts currently exports hooks and shared nudge types
- WHEN NudgeEngineContainer export is added
- THEN `import { NudgeEngineContainer } from '@features/nudge-engine'` resolves

### REQ-BARREL-ACTIVITY-TRACKER

`src/features/activity-tracker/index.ts` already exports `ActivityTrackerContainer`. No changes required.

### REQ-APP-IMPORTS-BARREL

`src/App.tsx` MUST import all 7 feature Containers via barrel paths. Deep imports (e.g., `@features/recipe-engine/RecipeEngineContainer`) SHALL be replaced.

#### Scenario: All imports simplified

- GIVEN App.tsx currently has 6 deep imports + 1 barrel import
- WHEN refactoring is applied
- THEN all 7 imports use `@features/<name>` barrel paths

### REQ-BARREL-TEST-REGRESSION

All 578 existing tests MUST pass without modification after barrels are created and App.tsx imports are updated.

#### Scenario: Zero test failures

- GIVEN the barrel refactoring is applied
- WHEN `pnpm test:run` is executed
- THEN 59 test files, 578 tests pass with zero failures

### REQ-BARREL-TYPECHECK

`pnpm typecheck` MUST pass with zero errors after all barrels are created.

#### Scenario: TypeScript resolves all barrel imports

- GIVEN all barrels created and App.tsx imports updated
- WHEN `pnpm typecheck` runs
- THEN zero type errors from import resolution
