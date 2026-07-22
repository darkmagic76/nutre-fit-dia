# Delta for dry-refactor

## ADDED Requirements

None — no new behavioral capabilities.

## MODIFIED Requirements

None — no spec-level behavioral changes.

## REMOVED Requirements

None — no spec-level removals.

## Refactoring Requirements (structural only)

### Requirement: Single Source of Truth for Sugar Aliases

The system MUST define all sugar alias strings in exactly one canonical location: `src/shared/domain/sugarAliases.ts`. Both `occultSugarDetector.ts` and `MockScannerAdapter.ts` MUST import from this shared source and MUST NOT define their own alias lists.

#### Scenario: Sugar aliases importable from shared domain

- GIVEN the shared sugar aliases module at `src/shared/domain/sugarAliases.ts`
- WHEN `occultSugarDetector.ts` imports from it
- THEN the occult detection logic uses the shared list, not a local const
- AND `MockScannerAdapter.ts` also imports from it
- AND the matching semantics (`includes` in detector, `Set.has` in adapter) are preserved per consumer

### Requirement: Shared Test Helpers

The system MUST define `createLocalStorage()` and `createMatchMedia()` in exactly one location: `src/test/test-helpers.ts`. Both `App.test.tsx` and `App.integration.test.tsx` MUST import from this shared location and MUST NOT define their own copies.

#### Scenario: Test helpers importable from shared test utility

- GIVEN the shared test helpers module at `src/test/test-helpers.ts`
- WHEN `App.test.tsx` imports `createLocalStorage` and `createMatchMedia` from it
- THEN `App.test.tsx` compiles and tests pass
- AND `App.integration.test.tsx` also imports from it
- AND `App.integration.test.tsx` compiles and tests pass
