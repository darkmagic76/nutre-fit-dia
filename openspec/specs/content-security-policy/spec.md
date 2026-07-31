# Content Security Policy Specification

## Purpose

Defines security headers for the NutriFit-Dia PWA to protect against XSS, MIME-sniffing, clickjacking, and privacy leaks.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | PWA MUST serve `Content-Security-Policy` header in production | MUST |
| R2 | PWA MUST serve `X-Content-Type-Options: nosniff` header | MUST |
| R3 | PWA MUST serve `Referrer-Policy: strict-origin-when-cross-origin` header | MUST |
| R4 | PWA MUST serve `Permissions-Policy: camera=(), microphone=(), geolocation=()` header | MUST |
| R5 | Development mode (`localhost`) MAY relax or omit CSP headers | MAY |
| R6 | CSP MUST NOT block service worker registration or PWA manifest fetch | MUST |
| R7 | Vite build output MUST include all security headers via `_headers` or equivalent | MUST |

### R1: Content-Security-Policy

The PWA MUST serve `Content-Security-Policy` header in production. Policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`.

#### Scenario: Production request includes all security headers

- GIVEN the PWA is loaded in production
- WHEN a request is made
- THEN `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers SHALL be present

#### Scenario: XSS payload blocked by script-src

- GIVEN a script injection attempt is made
- WHEN XSS payload is loaded
- THEN CSP SHALL block execution (script-src 'self' denies inline scripts and external sources)

#### Scenario: Clickjacking prevented

- GIVEN a third-party site attempts to embed the PWA in an iframe
- WHEN the frame loads
- THEN `frame-ancestors 'none'` SHALL prevent embedding

### R2: X-Content-Type-Options

The PWA MUST serve `X-Content-Type-Options: nosniff` to prevent MIME type sniffing.

#### Scenario: MIME type respected

- GIVEN a response with declared `Content-Type`
- WHEN the browser processes the response
- THEN the browser SHALL NOT override the declared MIME type

### R3: Referrer-Policy

The PWA MUST serve `Referrer-Policy: strict-origin-when-cross-origin` to limit referrer leakage.

#### Scenario: Cross-origin referrer stripped

- GIVEN the PWA links to an external site
- WHEN the user follows the link
- THEN the referrer SHALL include only the origin, never the full path

### R4: Permissions-Policy

The PWA MUST serve `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser features.

#### Scenario: Camera access denied

- GIVEN a script attempts to access `navigator.mediaDevices.getUserMedia`
- WHEN the permissions policy is active
- THEN camera access SHALL be denied

### R5: Development Mode Relaxation

In development mode (`localhost`), CSP headers MAY be relaxed or omitted to allow Vite HMR and devtools.

#### Scenario: HMR works on localhost

- GIVEN the PWA is running on `localhost`
- WHEN Vite HMR sends a WebSocket update
- THEN CSP SHALL NOT block the HMR connection

### R6: PWA Compatibility

CSP MUST NOT block the service worker registration (`service-worker.js`) or PWA manifest fetch (`manifest.webmanifest`).

#### Scenario: Service worker registers in production

- GIVEN the PWA is loaded in production with CSP active
- WHEN the browser registers the service worker
- THEN `script-src 'self'` SHALL allow `service-worker.js` from origin

#### Scenario: Manifest fetches

- GIVEN the PWA is loaded in production with CSP active
- WHEN the browser fetches `manifest.webmanifest`
- THEN `default-src 'self'` SHALL allow the manifest fetch

### R7: Build Output

The Vite build output MUST include all security headers in the generated HTML or via a `_headers` file (for deployment platforms that support it).

#### Scenario: `pnpm build` produces headers

- GIVEN `pnpm build` is executed
- WHEN inspecting `dist/_headers` or `dist/index.html`
- THEN all four security headers SHALL be present
