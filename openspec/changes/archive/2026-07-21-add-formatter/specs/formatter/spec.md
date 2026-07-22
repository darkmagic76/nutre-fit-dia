# Formatter Specification

## Purpose

Define the behavior of the project-wide code formatter. Ensures consistent code style across all source files with minimal configuration overhead.

## Requirements

### R1: Format all source files

The system MUST provide a `pnpm format` command that formats all source files in the project according to the Prettier configuration.

#### Scenario: Format all files in project

- GIVEN a project with source files in `src/`
- WHEN the user runs `pnpm format`
- THEN all `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.md` files in the project (excluding `node_modules/`, `dist/`, `coverage/`, `openspec/`) are reformatted according to Prettier config

#### Scenario: Already-formatted files change nothing

- GIVEN all source files are already formatted according to Prettier config
- WHEN the user runs `pnpm format`
- THEN no files are modified

### R2: Check formatting without modifying

The system MUST provide a `pnpm format:check` command that verifies all source files are formatted according to the Prettier configuration without modifying them.

#### Scenario: Check passes on formatted code

- GIVEN all source files are formatted according to Prettier config
- WHEN the user runs `pnpm format:check`
- THEN the command exits with code 0

#### Scenario: Check fails on unformatted code

- GIVEN a source file that does not conform to Prettier config
- WHEN the user runs `pnpm format:check`
- THEN the command exits with non-zero exit code and lists the unformatted file

### R3: Prettier config matches project conventions

The `.prettierrc` MUST configure Prettier to use the project's existing code style conventions.

#### Scenario: Config applies project defaults

- GIVEN the `.prettierrc` file exists at project root
- WHEN Prettier formats any source file
- THEN it MUST use `singleQuote: true`, `trailingCommas: "all"`, `tabWidth: 2`, `semi: true`, `printWidth: 100`

### R4: Formatter integrated into quality pipeline

The `pnpm quality` script MUST include `format:check` before `lint`.

#### Scenario: Quality pipeline runs format check

- GIVEN the `quality` script defined in `package.json`
- WHEN the user runs `pnpm quality`
- THEN `format:check` runs as the first step, before `lint`

#### Scenario: Unformatted code blocks quality

- GIVEN a source file that is not formatted according to Prettier config
- WHEN the user runs `pnpm quality`
- THEN the script fails before reaching the lint step

### R5: Formatted code preserves behavior

After formatting, all existing tests MUST pass and the project MUST build successfully.

#### Scenario: Tests pass after format

- GIVEN the project has been formatted with `pnpm format`
- WHEN the user runs `pnpm test:run`
- THEN all tests pass with the same results as before formatting

#### Scenario: Build succeeds after format

- GIVEN the project has been formatted with `pnpm format`
- WHEN the user runs `pnpm build`
- THEN the build succeeds without errors
