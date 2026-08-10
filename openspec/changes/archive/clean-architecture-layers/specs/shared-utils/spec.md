# Delta for Shared Utils

## REMOVED Requirements

### Requirement: `enum.ts` in shared/utils

`src/shared/utils/enum.ts` MUST be removed. `defineEnum` and `ValuesOf` SHALL live in `src/domain/enum.ts`.

(Reason: `defineEnum` is a type-level utility consumed exclusively by domain modules. Moving it into `domain/` eliminates a violation of Clean Architecture P1a — domain importing from shared/utils.)

#### Scenario: enum.ts absent from shared/utils

- GIVEN the refactor is applied
- WHEN listing `src/shared/utils/`
- THEN `enum.ts` SHALL NOT exist

## ADDED Requirements

### Requirement: Re-export Barrel for Backward Compatibility

`src/shared/utils/index.ts` SHALL re-export `defineEnum` and `ValuesOf` from `@domain/enum` to preserve existing imports during migration.

#### Scenario: Backward-compat re-export resolves

- GIVEN a consumer imports `{ defineEnum } from '@shared/utils'`
- WHEN the import resolves
- THEN `defineEnum` SHALL be the same function exported from `@domain/enum`
- AND no runtime breakage SHALL occur for pre-migration consumers
