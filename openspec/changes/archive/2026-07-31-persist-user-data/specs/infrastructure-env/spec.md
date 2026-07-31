# Infrastructure Env Specification

## Purpose

Zod schema validating `VITE_STORAGE_PREFIX`, `VITE_BASE_URL`, `VITE_LOG_LEVEL`. Stores import from this module — never `import.meta.env` directly. Lives in `src/infrastructure/`.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Env schema MUST validate `VITE_BASE_URL`, `VITE_STORAGE_PREFIX`, `VITE_LOG_LEVEL` via Zod | MUST |
| R2 | Stores MUST import validated env from this module, never `import.meta.env` | MUST |
| R3 | Schema MUST fail typecheck on missing or invalid env vars | MUST |
| R4 | Offline-first: env reads are synchronous, no network | MUST |

### R1: Env Validated Schema

The module MUST export a parsed env object `env` validated by Zod on import. `VITE_STORAGE_PREFIX` SHALL be a non-empty string. `VITE_BASE_URL` SHALL be a valid URL string (defaults to `/`). `VITE_LOG_LEVEL` SHALL be one of `debug | info | warn | error`.

#### Scenario: Valid env produces parsed object

- GIVEN `VITE_STORAGE_PREFIX=nutrifit`, `VITE_BASE_URL=/`, `VITE_LOG_LEVEL=info`
- WHEN the module is imported
- THEN `env.VITE_STORAGE_PREFIX` SHALL be `'nutrifit'`
- AND `env.VITE_LOG_LEVEL` SHALL be `'info'`

#### Scenario: Missing required var throws

- GIVEN `VITE_STORAGE_PREFIX` is undefined
- WHEN the module is imported at runtime
- THEN it SHALL throw a Zod validation error

### R2: Single Import Point

Stores and infrastructure modules MUST import `{ env }` from `@infrastructure/env`. Direct `import.meta.env.VITE_*` references MUST NOT exist outside this module.

#### Scenario: Tracker store reads prefix correctly

- GIVEN `createPersistConfig(env.VITE_STORAGE_PREFIX + '-tracker')`
- WHEN the persist config is created
- THEN the localStorage key SHALL use the validated prefix

### R3: Type Safety

The exported `env` object SHALL have TypeScript types inferred from the Zod schema. Invalid values SHALL fail at module parse time.

### R4: Offline-First

Env vars are baked at build time by Vite. No runtime network fetches.
