# https-transport Specification

## Purpose

Define HTTPS transport security for the PWA local development environment, implementing OWASP 2025 transport-layer hardening per RNF-04. The transport layer SHALL remain infrastructure-only and transparent to all domain code.

## Requirements

### Requirement: HTTPS Development Server

The Vite development server MUST serve the application over HTTPS using `@vitejs/plugin-basic-ssl`, which auto-generates self-signed certificates via Node.js `crypto` on first `pnpm dev`.

#### Scenario: Dev server starts on HTTPS

- GIVEN `@vitejs/plugin-basic-ssl` is installed and configured in `vite.config.ts`
- WHEN `pnpm dev` is executed
- THEN the dev server SHALL listen on `https://localhost:{port}`
- AND all connections SHALL be encrypted with TLS

#### Scenario: Dependency resolves in CI without external tools

- GIVEN `@vitejs/plugin-basic-ssl` is listed as a devDependency
- WHEN `pnpm install` runs in CI
- THEN the dependency SHALL resolve without errors
- AND no external CLI tools (mkcert, openssl) SHALL be required

### Requirement: CSP upgrade-insecure-requests

The Content-Security-Policy meta tag in `index.html` MUST include the `upgrade-insecure-requests` directive, instructing browsers to rewrite all HTTP resource URLs to HTTPS.

#### Scenario: CSP directive present after build

- GIVEN `index.html` is served by the dev server
- WHEN the CSP `<meta http-equiv="Content-Security-Policy">` tag is parsed
- THEN its `content` attribute SHALL contain `upgrade-insecure-requests`
- AND all other existing CSP directives SHALL remain unchanged

#### Scenario: Browser upgrades insecure resource requests

- GIVEN the CSP includes `upgrade-insecure-requests`
- WHEN a resource (script, image, fetch) is referenced over `http://`
- THEN the browser SHALL automatically rewrite the URL to `https://` before fetching

### Requirement: Zero Domain Impact

No file under `src/features/`, `src/shared/`, or `src/infrastructure/` MAY be modified by this change. Transport-layer configuration is infrastructure and MUST remain invisible to domain code.

#### Scenario: Domain source files untouched

- GIVEN the HTTPS change is applied
- WHEN comparing against the parent commit
- THEN zero files under `src/features/`, `src/shared/services/`, `src/shared/domain/`, `src/shared/stores/`, or `src/shared/hooks/` SHALL be modified

#### Scenario: All existing tests remain green

- GIVEN the HTTPS change is applied
- WHEN `pnpm test:run` executes
- THEN all existing tests SHALL pass
- AND no regressions SHALL be introduced in any feature or shared module

### Requirement: Architecture Compliance

The transport layer MUST remain infrastructure, transparent to the domain. Future hosting platform migrations SHALL require zero code changes in `features/` or `shared/`.

#### Scenario: Domain services are protocol-agnostic

- GIVEN HTTPS is configured solely in `vite.config.ts` (build tool config)
- WHEN any domain service, store, hook, or component is imported and invoked
- THEN it SHALL have zero knowledge of or dependency on the transport protocol

#### Scenario: Hosting platform migration with zero domain impact

- GIVEN the application migrates to a hosting platform that provides TLS natively
- WHEN `@vitejs/plugin-basic-ssl` is removed from `vite.config.ts`
- THEN `src/features/` and `src/shared/` SHALL require zero code changes

### Non-functional Requirements

| Area | Constraint |
|------|------------|
| Domain isolation | Transport config SHALL NOT leak into `features/`, `shared/`, or `infrastructure/` |
| Dependency footprint | Zero CLI prerequisites (no `mkcert`, `openssl`, or system CA tools required) |
| Browser compatibility | Self-signed cert warning is acceptable for local dev; one-time bypass per browser |
| Rollback | Remove plugin, revert `vite.config.ts` and `index.html` CSP; `pnpm test:run` MUST stay green |
| Scope Rule | No code used by <2 features SHALL move to `shared/`; this change touches zero feature code |
