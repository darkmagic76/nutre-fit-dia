# Tasks: Add Coverage Threshold Enforcement

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 10-15 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Configuration

- [x] 1.1 Add `coverage` block with `provider: 'v8'` and `thresholds` to `test` section in `vite.config.ts`

## Phase 2: Verification

- [x] 2.1 Run `pnpm test:coverage` — PASS (93.16% stmts, 89.06% branch, 87.30% funcs, 94.30% lines — all > 80%)
- [x] 2.2 Run `pnpm test:run` — PASS (53 files, 510 tests)
- [x] 2.3 Run `pnpm quality` — PASS (format:check, lint, typecheck, test:run)
