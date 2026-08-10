# Delta: shared-utils

## REMOVED Requirements

### Requirement: `parseNumeric()` in shared/utils

(Reason: `parseNumeric` is domain validation logic, not a presentation utility. It throws `ValidationError` which is a domain error. Moving to `domain/inputParsing.ts` to enforce dependency rule: application → domain, not application → shared.)

#### Scenario: parseNumeric no longer exists in shared/utils

- GIVEN `src/shared/utils/sanitize.ts`
- WHEN inspecting the file
- THEN the file SHALL NOT exist
- AND `parseNumeric` SHALL be imported from `@domain/inputParsing`

### Requirement: Re-export Barrel for Backward Compatibility

(Reason: Backward-compat re-exports hide the real source of truth. All consumers MUST import directly from `@domain/errors` and `@domain/inputParsing` to make dependencies explicit.)

#### Scenario: shared/errors.ts removed

- GIVEN `src/shared/errors.ts`
- WHEN inspecting the file
- THEN the file SHALL NOT exist
- AND all consumers SHALL import `ValidationError`, `DomainError`, `NotFoundError` from `@domain/errors`

#### Scenario: shared/utils/sanitize.ts removed

- GIVEN `src/shared/utils/sanitize.ts`
- WHEN inspecting the file
- THEN the file SHALL NOT exist
- AND all consumers SHALL import `parseNumeric` from `@domain/inputParsing`
