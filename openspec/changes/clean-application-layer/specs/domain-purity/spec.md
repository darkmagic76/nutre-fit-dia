# Delta: domain-purity

## ADDED Requirements

### Requirement: Domain Errors Module

`src/domain/errors.ts` MUST define `DomainError`, `DomainErrorCode`, `ValidationError`, and `NotFoundError`. It SHALL import only from TypeScript standard library and sibling domain modules.

#### Scenario: Domain errors file exists

- GIVEN `src/domain/errors.ts`
- WHEN inspecting the file
- THEN it SHALL export `DomainError`, `DomainErrorCode`, `ValidationError`, `NotFoundError`
- AND it SHALL NOT import from `@shared/`, `@infrastructure/`, `react`, or `zustand`

#### Scenario: ValidationError accepts error code and context

- GIVEN `new ValidationError('GLUCOSE_REQUIRED', { field: 'glucose' })`
- WHEN the error is constructed
- THEN `error.code` SHALL be `'GLUCOSE_REQUIRED'`
- AND `error.context` SHALL be `{ field: 'glucose' }`
- AND `error` SHALL be an instance of `DomainError` and `Error`

#### Scenario: DomainErrorCode is a union type

- GIVEN the `DomainErrorCode` type
- WHEN inspecting the definition
- THEN it SHALL be a union of string literals: `'GLUCOSE_REQUIRED' | 'GLUCOSE_MUST_BE_POSITIVE' | 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE' | 'IMC_THRESHOLD_CROSSED' | 'INVALID_NUMERIC_INPUT'`

### Requirement: Domain Input Parsing Module

`src/domain/inputParsing.ts` MUST define `parseNumeric`. It SHALL import only from `@domain/errors` and TypeScript standard library.

#### Scenario: parseNumeric exists in domain

- GIVEN `src/domain/inputParsing.ts`
- WHEN inspecting the file
- THEN it SHALL export `parseNumeric(value: string, max: number, min: number): number`
- AND it SHALL import `ValidationError` from `@domain/errors`
- AND it SHALL NOT import from `@shared/`, `@infrastructure/`, `react`, or `zustand`

#### Scenario: parseNumeric throws ValidationError with context

- GIVEN `parseNumeric('abc', 300, 30)`
- WHEN the function is called
- THEN it SHALL throw `ValidationError` with `code: 'INVALID_NUMERIC_INPUT'`
- AND `error.context` SHALL contain `{ value: 'abc', max: 300, min: 30 }`

#### Scenario: parseNumeric returns number for valid input

- GIVEN `parseNumeric('80.5', 300, 30)`
- WHEN the function is called
- THEN it SHALL return `80.5`
