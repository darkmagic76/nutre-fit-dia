## Exploration: HTTPS Protocol — Local mkcert + Vite HTTPS (RNF-04)

### ⚠️ CORRECTION FROM PREVIOUS EXPLORATION

The previous exploration (sdd/enable-https-protocol/explore, #463) assumed Vercel hosting, Supabase backend, domain registration, HSTS headers, CI/CD deployment, and external platform dependencies — all of which are **OUT OF SCOPE** per user decision.

**What is discarded from previous exploration:**
- ❌ Vercel-native approach (vercel.json, deploy workflows)
- ❌ GitHub Pages approach
- ❌ Hybrid Vercel approach
- ❌ HSTS header discussion (impossible via `<meta>` tags)
- ❌ HTTP→HTTPS redirect (requires hosting platform/reverse proxy)
- ❌ Service worker / secure cookie discussion (premature)
- ❌ All deployment/CI/CD pipeline proposals
- ❌ Supabase `connect-src` removal from CSP (noted but not in scope)
- ❌ ADR-009 hosting decision treated as blocking dependency

**What is PRESERVED:**
- ✅ CSP needs `upgrade-insecure-requests` directive
- ✅ Transport layer is infrastructure — must be transparent to domain
- ✅ CSP meta tag content can be tested via DOM unit test
- ✅ Infrastructure/config files only — no feature/domain code touched

### Current State

The project is a React 19 SPA (Vite 8.1.1, TypeScript 6.0.2, TailwindCSS 4.3.2) with Screaming Architecture + Scope Rule and 7 features. It has no backend, no auth, no external hosting, no Supabase client code in `src/`, and no service worker. It is installed as a PWA directly from the browser.

**Current HTTPS/security posture:**

| Layer | Status | Detail |
|-------|--------|--------|
| Dev server (Vite) | ❌ HTTP only | `vite.config.ts` has no `server.https` config |
| CSP `upgrade-insecure-requests` | ❌ Missing | Existing CSP has all directives but this one |
| `vite-plugin-mkcert` | ❌ Not installed | Not in `package.json` |
| `mkcert` CLI on dev machine | ❌ Not documented | README doesn't mention it |
| CSP `connect-src` Supabase | ⚠️ Present but unused | `https://*.supabase.co` is in CSP; it's premature per user decision but NOT in scope to remove |

**Current CSP in index.html (line 17):**
```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self';
connect-src 'self' https://*.supabase.co;
frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

**Existing security infra:**
- `public/.well-known/security.txt` (RFC 9116) — references `https://nutrefitdia.dev`
- `public/manifest.json` — PWA manifest (browser requires HTTPS for PWA install)
- ErrorBoundary, Zod runtime validation, no `dangerouslySetInnerHTML`
- Dev security headers via `<meta>`: X-Content-Type-Options, Referrer-Policy, Permissions-Policy

**Documentation of intended approach:**
- `SPECS_RF.md` RNF-04: "Desarrollo local con `mkcert` + Vite `server.https`. La capa de transporte es infraestructura: debe ser transparente al dominio y pluggable"
- `SPECS_TECH.md` §7: Same spec, plus explicit note that "hoy no hay plataforma externa"

### What's Already Documented vs What's Implemented

| Requirement (RNF-04) | Documented | Implemented |
|----------------------|------------|-------------|
| mkcert local certs | ✅ SPECS_RF, SPECS_TECH | ❌ |
| Vite `server.https` config | ✅ SPECS_TECH | ❌ |
| CSP `upgrade-insecure-requests` | ✅ SPECS_RF, SPECS_TECH | ❌ |
| Transport is infrastructure, pluggable | ✅ SPECS_TECH | ✅ (by absence — no coupling exists) |

### What This Change Entails

#### 1. Install `vite-plugin-mkcert` npm package

- **Package**: `vite-plugin-mkcert@^2.1.0`
- **Peer deps**: `vite: '>=3'` ✅ compatible with Vite 8.1.1
- **Own deps**: `debug`, `supports-color`, `undici` — auto-installed via pnpm
- **Command**: `pnpm add -D vite-plugin-mkcert`
- **External requirement**: `mkcert` CLI must be installed on the developer's machine (one-time): `brew install mkcert` (macOS), `choco install mkcert` (Windows), `apt install mkcert` (Linux), or build from source. The plugin calls `mkcert -install` automatically on first run if not already installed.

#### 2. Configure `vite.config.ts`

Add to `vite.config.ts`:
```typescript
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), tailwindcss(), mkcert()],
  server: {
    https: true,
  },
  // ... existing resolve, test config
});
```

This enables:
- Vite dev server serves over HTTPS via locally-trusted certs
- Auto-detects/installs mkcert CA on first run
- Certificates are auto-generated for `localhost` and `127.0.0.1`

#### 3. Add `upgrade-insecure-requests` to CSP in `index.html`

Current CSP on line 17:
```
content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
```

Change to:
```
content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
```

`upgrade-insecure-requests` is a CSP directive that tells the browser to rewrite all HTTP URLs to HTTPS before making requests. This ensures that even if a resource URL uses HTTP, the browser will request it over HTTPS. It only works when the page itself is served over HTTPS.

#### 4. Optional: Update README §11 HTTPS row

Current README §11 says: "HTTPS | Requerido por CSP + PWA" — add mention of mkcert + Vite approach.

#### 5. Optional: Unit test for CSP meta tag

Add a test to `src/App.test.tsx` that verifies:
```typescript
it('includes upgrade-insecure-requests in CSP', () => {
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  expect(meta).toBeInTheDocument();
  expect(meta?.getAttribute('content')).toContain('upgrade-insecure-requests');
});
```

### Architecture Validation: Infrastructure-Only Change

This change touches **ZERO domain code**. Verified by file scope:

| File | Layer | Current Content | Change |
|------|-------|-----------------|--------|
| `package.json` | Deps management | No mkcert plugin | Add devDependency |
| `vite.config.ts` | Build tool config | No server.https | Add plugin + config |
| `index.html` | HTML shell | CSP without upgrade-insecure-requests | Add directive |
| `README.md` §11 | Documentation | HTTPS row generic | Add mkcert detail |
| `src/App.test.tsx` | Test | Exists | Add CSP meta test |

**No feature files, no shared services, no domain types, no stores touched.** The transport layer is fully transparent to the domain — any future hosting migration (Vercel, Supabase, custom server) would only touch these same config files.

### Testing Strategy

| Test Type | What | Feasibility |
|-----------|------|-------------|
| **Unit test** | CSP meta tag contains `upgrade-insecure-requests` | ✅ Easy — DOM inspection in jsdom, add to `App.test.tsx` |
| **Unit test** | Vite config validates schema (optional) | ⚠️ Low value — would test Vite, not our code |
| **E2E** | Page loads over HTTPS in dev | ⚠️ Possible but requires running dev in HTTPS mode; E2E currently uses `localhost` |
| **Dev UX** | `pnpm dev` serves HTTPS | ✅ Manual verification: browser shows lock icon |

### Scope Estimation

| Change | Files | Lines |
|--------|-------|-------|
| Install `vite-plugin-mkcert` dep | `package.json` | +1 line |
| Configure `vite.config.ts` | `vite.config.ts` | +5-7 lines |
| Add `upgrade-insecure-requests` to CSP | `index.html` | +1 token on line 17 |
| CSP unit test | `src/App.test.tsx` | +10-15 lines |
| README §11 update (optional) | `README.md` | +2-3 lines |
| **Total** | **3-5 files** | **~20-25 lines changed** |

No new files created. All changes are inline modifications. 0 new files.

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **mkcert CLI not installed** | Plugin auto-runs `mkcert -install` on first start — will fail with clear error if CLI not found | Document in README: `brew install mkcert` / `apt install mkcert` / `choco install mkcert` |
| **mkcert CA not trusted in Node.js for API calls** | Node fetch/http don't use system root store by default | Only relevant if dev server makes HTTPS API calls to itself; not applicable for SPA |
| **Windows admin privileges** | `mkcert -install` needs admin on Windows | Document as platform-specific prerequisite |
| **Dev script still defaults to HTTP** | `vite` starts on HTTP, `pnpm dev --https` needed or config change | The config change (`server.https: true`) makes HTTPS the default for `pnpm dev` |
| **Browser shows cert warning for localhost** | Usually safe — mkcert CAs are trusted | If warning appears, run `mkcert -install` manually |
| **HSTS impossible** | No real HTTP headers → no HSTS | Acceptable for local dev. HSTS only matters on deployed production domains |
| **PWA install over HTTP** | Browsers require HTTPS for PWA install prompt | After this change, dev mode serves HTTPS → PWA install works in dev |

### Discarded Approaches

| Approach | Why Discarded |
|----------|---------------|
| Vercel-native (previous exploration) | ❌ User explicitly said NO Vercel, NO external hosting. Premature — no feature requires it yet. |
| GitHub Pages deployment | ❌ Same reason: no deployment needed. Premature infrastructure. |
| Self-signed certs manually | ❌ mkcert auto-generates + auto-trusts. Manual self-signed certs require manual trust installation per browser. |
| HSTS via `<meta>` | ❌ Browsers don't honor `<meta http-equiv="Strict-Transport-Security">`. Only real HTTP headers work. |

### Recommendation

**Single approach**: `vite-plugin-mkcert` + `server.https` + CSP directive.

There is no meaningful fork here — the solution is a straight line:
1. Add `vite-plugin-mkcert` devDependency
2. Import and register the plugin in `vite.config.ts`, set `server.https: true`
3. Append `upgrade-insecure-requests` to the existing CSP
4. (Optional) Add unit test for CSP content
5. Document `mkcert CLI` prerequisite in README

### Ready for Proposal

Yes — this exploration is complete. The orchestrator should proceed to `sdd-propose` with the corrected scope.

The change is small (~20 lines, 3-5 files, all infra/config), safe (no domain code touched), and fully documented in SPECS_RF + SPECS_TECH.
