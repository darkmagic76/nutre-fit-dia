# Path Aliases Specification

## Purpose

TypeScript and Vite path alias definitions for `@domain/*` and `@application/*`. Must be kept in sync across `tsconfig.app.json` and `vite.config.ts` per AGENTS.md convention.

## Requirements

### Requirement: @domain Alias

`@domain/*` MUST resolve to `src/domain/*` at build and runtime. Defined in BOTH `tsconfig.app.json` and `vite.config.ts`.

#### Scenario: @domain import resolves

- GIVEN `import { Food } from '@domain'`
- WHEN `pnpm typecheck` executes
- THEN zero type errors SHALL be reported
- WHEN `pnpm build` executes
- THEN the production bundle SHALL resolve `@domain` to `src/domain/*`

### Requirement: @application Alias

`@application/*` MUST resolve to `src/application/*` at build and runtime. Defined in BOTH `tsconfig.app.json` and `vite.config.ts`.

#### Scenario: @application import resolves

- GIVEN `import { NotificationRepository } from '@application/ports/notificationRepository'`
- WHEN `pnpm typecheck` executes
- THEN zero type errors SHALL be reported

### Requirement: Alias Sync

`tsconfig.app.json` paths and `vite.config.ts` resolve.alias MUST stay synchronized. Any alias added to one MUST be mirrored in the other.

#### Scenario: Aliases match between configs

- GIVEN `tsconfig.app.json` defines `@domain/*` and `@application/*`
- THEN `vite.config.ts` SHALL define the same aliases pointing to the same directories
- AND a mismatch between configs SHALL cause a build failure
