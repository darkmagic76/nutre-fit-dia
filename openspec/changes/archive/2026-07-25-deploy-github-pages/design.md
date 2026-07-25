# Design: Deploy to GitHub Pages & Remove Supabase References

## Technical Approach

Config-only deploy pipeline. Two GitHub Actions workflows: `ci.yml` (quality gate on push/PR) and `deploy.yml` (Pages deploy on push to main). Vite `base: '/nutre-fit-dia/'` auto-prefixes asset paths. Manual path corrections for manifest.json, security.txt link, and CSP. Supabase references stripped from caching config, CSP, README, and SETUP. Zero runtime logic changes, zero test impact.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Two workflows | `ci.yml` + `deploy.yml` | One combined workflow with conditional deploy | Separation of concerns: CI runs on every push/PR to develop; deploy only triggers on main push. If CI fails, merge is blocked — deploy never fires with broken code. |
| Deploy action | `actions/deploy-pages` (official) | `peacefuliron/peaceful-playground`, `JamesIves/github-pages-deploy-action` | Official GitHub action, zero maintenance burden, built-in Pages environment with OIDC. No third-party trust required. |
| Node version | `lts/*` via `actions/setup-node` | Pin specific version via `.nvmrc` | No `.nvmrc` exists. LTS track ensures CI doesn't break on Node EOL. Can be pinned later when `.nvmrc` is introduced. |
| security.txt path | Relative `".well-known/security.txt"` | `import.meta.env.BASE_URL`, `process.env` | Vite's `base` transform only applies to `<link>`, `<script>` in index.html, not JSX string literals. Relative path works regardless of subpath. |
| Manifest fix | Manual edit `public/manifest.json` | Auto-generate via `vite-plugin-pwa` with `manifest: {}` config | Current config uses `manifest: false` (static file). Switching to auto-generation adds complexity for this change. L1 decision — punt to V2. |
| Package install | `pnpm install --frozen-lockfile` | `pnpm install` | Enforces lockfile integrity in CI. Fails fast if `pnpm-lock.yaml` is out of sync. |
| Main immutability | Branch protection: require PR + approval before merge to main | Direct push, force push | `main` is the production trigger. Any push to main → deploy. Must be protected against unreviewed code reaching production. Only authorized merges go through. |

## Branch Protection Rules

`main` branch MUST be immutable — no direct pushes, no force pushes. Only way in is through an approved PR merge. This is non-negotiable:

- `main` triggers `deploy.yml` → unreviewed push = unreviewed deploy
- Protects against accidental `git push origin develop:main`
- Enforced via GitHub Branch Protection: require pull request, require 1+ approval, dismiss stale reviews

## Data Flow

```
push to develop ──→ ci.yml ──→ pnpm quality (format:check + lint + typecheck + test:run)
       │
       │ PR approved ──→ merge (only authorized)
       ▼
push to main ──→ deploy.yml ──→ checkout → pnpm install --frozen-lockfile → pnpm build
                                      │
                                      ▼
                                 upload-pages-artifact (dist/)
                                      │
                                      ▼
                                 deploy-pages ──→ darkmagic76.github.io/nutre-fit-dia/
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Modify | Add `base: '/nutre-fit-dia/'`, remove `runtimeCaching` Supabase entry (L23-31) |
| `public/manifest.json` | Modify | `start_url`: `"/nutre-fit-dia/"`, add `scope`, fix `icons[0].src` |
| `src/App.tsx` | Modify | L163: absolute `"/.well-known/security.txt"` → relative `".well-known/security.txt"` |
| `index.html` | Modify | Remove ` https://*.supabase.co` from CSP `connect-src` |
| `.github/workflows/ci.yml` | Create | Quality gate: checkout → setup-node (lts/*, pnpm) → `pnpm quality` |
| `.github/workflows/deploy.yml` | Create | Deploy: checkout → setup-node → install → build → upload → deploy (3 official actions) |
| `README.md` | Modify | Remove Supabase JS row from EN stack table (L32) and ES stack table (L232) |
| `SETUP.md` | Modify | Remove 4 Supabase references: EN L70 + L254, ES L377 + L561 |
| `openspec/config.yaml` | Modify | Update context: "SPA + Supabase BaaS (ADR-009)" → "SPA (static-only)" |

## Permissions

`deploy.yml` job-level:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

- `contents: read` — checkout
- `pages: write` — upload artifact
- `id-token: write` — OIDC for `deploy-pages` authentication

`ci.yml` — no explicit permissions needed (defaults suffice for checkout).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | `pnpm build` succeeds with `base` | CI build step (already covered by `pnpm verify` incl. `pnpm build`) |
| Unit | No regressions | Existing 580 tests must pass unmodified |
| Visual | Asset paths in `dist/index.html` | Manual post-deploy inspection |
| Manifest | PWA installable on deployed URL | Lighthouse PWA audit post-deploy |

## Migration / Rollout

No data migration. Rollback: `git revert` the merge commit. Disable Pages in repo Settings for instant deploy stop.

## Open Questions

None. All decisions are resolved.
