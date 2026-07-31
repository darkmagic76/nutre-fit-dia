# https-transport Specification

## Purpose

Define HTTPS transport security for the PWA, implementing OWASP 2025 transport-layer hardening per RNF-04. The transport layer SHALL remain infrastructure-only and transparent to all domain code.

## Requirements

### Requirement: HTTP localhost Development

The Vite development server SHALL serve the application over HTTP on `localhost`. Browsers exempt `localhost` from HTTPS requirements for Service Workers and Web Crypto APIs, making HTTPS unnecessary for local development of a static SPA.

#### Scenario: Dev server starts on HTTP localhost

- GIVEN `vite.config.ts` has no SSL plugin configured
- WHEN `pnpm dev` is executed
- THEN the dev server SHALL listen on `http://localhost:5173`
- AND the PWA service worker SHALL register successfully

#### Scenario: Zero dependency footprint

- GIVEN no SSL-related devDependencies are installed
- WHEN `pnpm install` runs
- THEN the dependency tree SHALL contain zero SSL/cert packages
- AND no external CLI tools (mkcert, openssl) SHALL be required

### Requirement: Production HTTPS via GitHub Pages

In production, the application SHALL be served over HTTPS by GitHub Pages, which provides automatic TLS certificate management. No additional configuration SHALL be required.

#### Scenario: Production deployment serves HTTPS

- GIVEN the application is deployed to GitHub Pages
- WHEN a user accesses `https://darkmagic76.github.io/nutre-fit-dia/`
- THEN all connections SHALL be encrypted with TLS
- AND the browser SHALL show a secure connection indicator

### Requirement: CSP upgrade-insecure-requests

The Content-Security-Policy meta tag in `index.html` MUST include the `upgrade-insecure-requests` directive, instructing browsers to rewrite all HTTP resource URLs to HTTPS in production.

#### Scenario: CSP directive present

- GIVEN `index.html` is served
- WHEN the CSP `<meta http-equiv="Content-Security-Policy">` tag is parsed
- THEN its `content` attribute SHALL contain `upgrade-insecure-requests`

#### Scenario: Browser upgrades insecure resource requests

- GIVEN the CSP includes `upgrade-insecure-requests`
- WHEN a resource is referenced over `http://`
- THEN the browser SHALL automatically rewrite the URL to `https://` before fetching

### Requirement: Zero Domain Impact

No file under `src/features/`, `src/shared/`, or `src/infrastructure/` MAY depend on the transport protocol. Transport-layer configuration is infrastructure and MUST remain invisible to domain code.

#### Scenario: Domain source files are protocol-agnostic

- GIVEN the transport configuration is solely in `vite.config.ts`
- WHEN any domain service, store, hook, or component is imported and invoked
- THEN it SHALL have zero knowledge of or dependency on the transport protocol

#### Scenario: Hosting platform migration with zero domain impact

- GIVEN the application migrates to a hosting platform that provides TLS natively
- WHEN the hosting configuration changes
- THEN `src/features/` and `src/shared/` SHALL require zero code changes

### Requirement: CSP-CONNECT

The Content-Security-Policy `connect-src` directive in `index.html` SHALL NOT include `https://*.supabase.co`. Only `'self'` SHALL remain in connect-src.

#### Scenario: CSP meta tag does not reference supabase.co

- GIVEN `index.html` contains a CSP meta tag in its `<head>`
- WHEN `pnpm build` runs and `dist/index.html` is produced
- THEN the `content` attribute of the CSP meta tag SHALL contain `connect-src 'self'` with no `supabase.co` host

### Non-functional Requirements

| Area | Constraint |
|------|------------|
| Domain isolation | Transport config SHALL NOT leak into `features/`, `shared/`, or `infrastructure/` |
| Dependency footprint | Zero SSL packages in devDependencies |
| Browser compatibility | `localhost` HTTP exempt from HTTPS requirements for SW + Web Crypto |
| Rollback | Zero rollback needed — no SSL config to revert |
| Scope Rule | No code used by <2 features SHALL move to `shared/`; this change touches zero feature code |
