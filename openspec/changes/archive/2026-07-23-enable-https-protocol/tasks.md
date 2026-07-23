# Tasks: Enable HTTPS Protocol (RNF-04)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 8–12 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Phase 1: Test-First — RED

- [x] 1.1 `src/App.test.tsx`: Add `import indexHtml from '../index.html?raw'` + `it('includes upgrade-insecure-requests in CSP')` asserting `expect(indexHtml).toContain('upgrade-insecure-requests')`. Run `pnpm test:run` → MUST FAIL (REQ-2)

## Phase 2: Foundation — Deps & Vite Config

- [x] 2.1 `pnpm add -D @vitejs/plugin-basic-ssl` → updates `package.json` + lockfile (REQ-1)
- [x] 2.2 `vite.config.ts`: Add `import basicSsl from '@vitejs/plugin-basic-ssl'` after line 4. Append `basicSsl()` to plugins array (REQ-1)

## Phase 3: Implementation — GREEN

- [x] 3.1 `index.html` L17: Append `upgrade-insecure-requests` to CSP `content` before closing `"`. Run `pnpm test:run` → task 1.1 MUST PASS (REQ-2)

## Phase 4: Verification & Docs

- [x] 4.1 `pnpm test:run` → all 545+ existing tests green, zero regressions (REQ-3)
- [x] 4.2 `README.md` L315: Replace HTTPS row with `@vitejs/plugin-basic-ssl + CSP upgrade-insecure-requests` (REQ-4)
- [x] 4.3 Scope Rule check: `git diff --stat src/features/ src/shared/ src/infrastructure/` → zero changes (REQ-3, REQ-4)

## Dependencies

```
1.1 (RED) ──────────────────┐
                            ├──► 3.1 (GREEN) ──► 4.1 (regression)
2.1 (dep) ──► 2.2 (config) ──────────────────► 4.2 (README)
                                               └──► 4.3 (scope check)
```

1.1 and 2.1 are parallel-safe. 2.2 requires 2.1. 3.1 requires 1.1 written first (TDD). 4.x require all prior phases complete.

## AAA Validation Checklist

| Task | Arrange | Act | Assert |
|------|---------|-----|--------|
| 1.1 | Import `index.html?raw` at module level | Read `indexHtml` value | `expect(indexHtml).toContain('upgrade-insecure-requests')` |

## Risk Notes

- Self-signed cert browser warning: expected, one-time bypass per browser
- `@vitejs/plugin-basic-ssl` ≥2.0.0 compatible with Vite 8.1.1 (`vite >=5` peer)
- Rollback: `pnpm remove @vitejs/plugin-basic-ssl` + revert `vite.config.ts` L2-8 + revert `index.html` L17
- Zero domain files touched — Scope Rule verified by task 4.3
