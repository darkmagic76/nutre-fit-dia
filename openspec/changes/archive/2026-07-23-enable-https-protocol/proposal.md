# Proposal: Enable HTTPS Protocol (RNF-04)

## Intent

Implement OWASP 2025 transport security per RNF-04: serve PWA over HTTPS in local dev. Gap: `vite.config.ts` has no `server.https`, CSP lacks `upgrade-insecure-requests`. README §11 lists HTTPS as required but unimplemented.

## Scope

### In Scope
- Install `@vitejs/plugin-basic-ssl` (official Vite plugin, zero CLI deps)
- Add `basicSsl()` to `vite.config.ts` plugins + `server.https: true`
- Append `upgrade-insecure-requests` to CSP meta in `index.html`
- Unit test: CSP meta contains `upgrade-insecure-requests`
- README §11: document basic-ssl approach

### Out of Scope
- Vercel, Supabase, external hosting, HSTS, deploy workflows, domain registration
- Any changes to `features/`, `shared/`, `infrastructure/` or domain code
- Supabase `connect-src` removal from CSP

## Capabilities

### New Capabilities
- `https-transport`: Local dev HTTPS via `@vitejs/plugin-basic-ssl` (auto-generates certs with `node:crypto`). CSP `upgrade-insecure-requests` enforced.

### Modified Capabilities
None. Infrastructure-only change — zero spec-level requirement changes.

## Approach

`@vitejs/plugin-basic-ssl` is the official Vite HTTPS plugin. On first `pnpm dev`, it auto-generates a self-signed certificate via Node.js `crypto` — no `mkcert` CLI install, no manual trust steps. Functionally equivalent to mkcert but purely in-process. CSP `upgrade-insecure-requests` tells browsers to rewrite all HTTP URLs to HTTPS.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | +1 `@vitejs/plugin-basic-ssl` devDep |
| `vite.config.ts` | Modified | +import `basicSsl`, +plugin, +`server.https: true` |
| `index.html` line 17 | Modified | +`upgrade-insecure-requests` in CSP |
| `src/App.test.tsx` | Modified | +1 test: CSP directive assertion |
| `README.md` §11 | Modified | Document basic-ssl instead of generic HTTPS |
| `features/`, `shared/`, `infrastructure/` | **Untouched** | Architecture constraint verified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Browser self-signed cert warning | High | Acceptable for local dev; one-time bypass per browser |
| Plugin version vs Vite 8.x | Low | Official Vite plugin, compatible with Vite ≥5 |

## Rollback Plan

1. `pnpm remove @vitejs/plugin-basic-ssl`
2. Revert `vite.config.ts`: remove `basicSsl` import, plugin, and `server.https`
3. Revert `index.html`: remove `upgrade-insecure-requests` from CSP
4. Run `pnpm test:run` — must be green

## Dependencies

- `@vitejs/plugin-basic-ssl` (devDependency, Vite ≥5 required — satisfied by Vite 8.1.1)

## Success Criteria

- [ ] `pnpm dev` serves HTTPS (browser lock icon)
- [ ] CSP `upgrade-insecure-requests` unit test passes
- [ ] `pnpm test:run` all 545 tests green
- [ ] Zero feature/domain files touched — Scope Rule compliance
