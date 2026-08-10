# Domain Purity Specification

## Purpose

`src/domain/` MUST be 100% pure TypeScript — zero framework, React, Zustand, or Web API imports. The only external dependency allowed is `zod` for schema validation. This spec governs import boundaries for the domain layer.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Domain files MUST import only `zod` and other domain modules | MUST |
| R2 | `enum.ts` MUST live in `domain/` as the source of truth for `defineEnum` and `ValuesOf` | MUST |
| R3 | `CATEGORY_DISPLAY_NAMES` MUST NOT exist in domain | MUST NOT |
| R4 | Domain MUST NOT import from `@shared/utils`, `@infrastructure/*`, React, Zustand, or Web APIs | MUST NOT |
| R5 | A lint rule SHALL enforce domain import restrictions at build time | SHALL |

### R1: Domain Import Boundary

Every file under `src/domain/` MUST restrict imports to `zod` and sibling domain modules. No framework, UI, or infrastructure imports allowed.

#### Scenario: Domain file imports only zod and domain modules

- GIVEN a file at `src/domain/food.ts`
- WHEN inspecting its imports
- THEN every import SHALL resolve to `zod`, a `domain/` sibling, or TypeScript types
- AND no import from `@shared/utils`, `@infrastructure/*`, React, or Zustand SHALL exist

#### Scenario: Build-time enforcement catches violations

- GIVEN a domain file with a `@shared/utils` import
- WHEN `pnpm typecheck` executes
- THEN the build SHALL fail with a clear import restriction error

### R2: defineEnum Source of Truth

`defineEnum` and `ValuesOf` MUST be defined in `src/domain/enum.ts`. All consumers SHALL import from domain.

#### Scenario: defineEnum resolves from domain

- GIVEN `notification.ts` needs `defineEnum`
- WHEN the import is written
- THEN it SHALL use `import { defineEnum } from './enum'` or `@domain`
- AND `@shared/utils/enum` SHALL NOT be the import source

### R3: No Display Names in Domain

`CATEGORY_DISPLAY_NAMES` MUST NOT be exported from any domain file. Display names are an i18n concern.

#### Scenario: CATEGORY_DISPLAY_NAMES absent from domain

- GIVEN `src/domain/foodCategory.ts`
- WHEN inspecting exports
- THEN `CATEGORY_DISPLAY_NAMES` SHALL NOT be present

### R4: Zero Framework/Web API Imports

No domain file SHALL import React hooks, Zustand stores, or browser Web APIs.

#### Scenario: Zero React, Zustand, or Web API in domain grep

- GIVEN a search for `from 'react'`, `from 'zustand'`, `localStorage`, or `window.` in `src/domain/`
- THEN zero matches SHALL be found
