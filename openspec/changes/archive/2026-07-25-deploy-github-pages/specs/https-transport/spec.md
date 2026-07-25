# Delta for https-transport

## ADDED Requirements

### Requirement: CSP-CONNECT

The Content-Security-Policy `connect-src` directive in `index.html` SHALL NOT include `https://*.supabase.co`. Only `'self'` SHALL remain in connect-src.

#### Scenario: CSP meta tag does not reference supabase.co after build

- GIVEN `index.html` contains a CSP meta tag in its `<head>`
- WHEN `pnpm build` runs and `dist/index.html` is produced
- THEN the `content` attribute of the CSP meta tag SHALL contain `connect-src 'self'` with no `supabase.co` host

#### Scenario: Connect-src allows local API only

- GIVEN the deployed CSP has `connect-src 'self'` with no external hosts
- WHEN the app makes a `fetch` or `XMLHttpRequest`
- THEN only same-origin connections SHALL be permitted by the browser's CSP enforcement
