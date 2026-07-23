# Design: Enable HTTPS Protocol (RNF-04)

## Technical Approach

Add `@vitejs/plugin-basic-ssl` (official Vite plugin, zero CLI deps, auto-generates certs via `node:crypto`) to `vite.config.ts`. Append `upgrade-insecure-requests` to CSP meta in `index.html`. Infrastructure-only change — zero domain code touched. Per RNF-04 and spec REQ-3/REQ-4.

## Architecture Decisions

| Decision | Option A | Option B | Choice | Rationale |
|----------|----------|----------|--------|-----------|
| SSL plugin | `vite-plugin-mkcert` (CLI prerequisite) | `@vitejs/plugin-basic-ssl` (in-process, `node:crypto`) | **basic-ssl** | Zero CLI install. CI/CD safe. `mkcert` requires external binary on every dev machine. `basic-ssl` resolves purely via npm |
| CSP test strategy | Inject meta into jsdom | Read `index.html` via `?raw` import | **`?raw` import** | Honest — tests actual file, not test-setup artifact. `?raw` is Vite-native, Vitest-compatible |
| Plugin position | Before react() | After existing plugins | **After** | No ordering dependency. Appended to existing plugin chain |

**Security-by-Design validation**: Transport layer is pluggable infrastructure. Remove `basicSsl()`, replace with Vercel-native TLS — zero domain code changes. SRP: `vite.config.ts` owns transport; `index.html` owns policy. Domain files never reference `https://` or any transport protocol.

## Data Flow

```
pnpm dev
  │
  ▼
Vite loads basicSsl() plugin
  │
  ├── node:crypto.generateKeyPairSync() ──► self-signed cert (memory only)
  ├── Vite starts https://localhost:5173
  │
  ▼
Browser loads index.html
  │
  ├── CSP meta parsed: upgrade-insecure-requests
  ├── All http:// refs auto-rewritten to https://
  │
  ▼
React App renders (unchanged, transport-agnostic)
```

## File Changes

| File | Action | Before → After |
|------|--------|---------------|
| `package.json` L46 | Modify | devDependencies: add `"@vitejs/plugin-basic-ssl": "^2.0.0"` |
| `vite.config.ts` L2-8 | Modify | +`import basicSsl from '@vitejs/plugin-basic-ssl'`; plugins: `[react(), tailwindcss(), basicSsl()]` |
| `index.html` L17 | Modify | content: `...form-action 'self'; upgrade-insecure-requests"` — token appended before closing `"` |
| `src/App.test.tsx` | Modify | +1 test: CSP directive assertion via `?raw` import of `index.html` |
| `README.md` L315 | Modify | HTTPS row: `@vitejs/plugin-basic-ssl + CSP upgrade-insecure-requests` |

**Zero changes** to: `src/features/`, `src/shared/`, `src/infrastructure/`.

## Interfaces / Contracts

No new interfaces. The CSP directive `upgrade-insecure-requests` is a standard CSP level 2 keyword — zero polyfills needed. `@vitejs/plugin-basic-ssl` exposes `basicSsl()` factory, no config options required.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | CSP directive in `index.html` | AAA: Arrange → import HTML raw, Act → read content, Assert → `expect(html).toContain('upgrade-insecure-requests')` |
| Regression | All 544 existing tests | `pnpm test:run` — must stay green |
| Manual | Dev server HTTPS | Browser lock icon on `https://localhost:5173` |

Test addition in `src/App.test.tsx`:

```typescript
import indexHtml from '../../index.html?raw';

it('includes upgrade-insecure-requests in CSP', () => {
  // Arrange: import at module level (above)
  // Act: read raw
  expect(indexHtml).toContain('upgrade-insecure-requests');
});
```

## Migration / Rollout

No migration required. Rollback:
1. `pnpm remove @vitejs/plugin-basic-ssl`
2. Revert `vite.config.ts`: remove `basicSsl` import + plugin entry
3. Revert `index.html`: remove `upgrade-insecure-requests` token
4. `pnpm test:run` — assert 544 tests green

## Open Questions

None.
