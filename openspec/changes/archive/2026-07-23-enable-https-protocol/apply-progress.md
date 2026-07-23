# Apply Progress: Enable HTTPS Protocol (RNF-04)

**Date**: 2026-07-23
**Mode**: Strict TDD
**Artifact store**: both (OpenSpec + Engram)

## Completed Tasks

- [x] 1.1 Write AAA test for CSP `upgrade-insecure-requests` in `src/App.test.tsx`
- [x] 2.1 Install `@vitejs/plugin-basic-ssl` (v2.3.0)
- [x] 2.2 Configure Vite with `basicSsl()` plugin in `vite.config.ts`
- [x] 3.1 Add `upgrade-insecure-requests` to CSP in `index.html`
- [x] 4.1 Full regression — all 545 tests pass
- [x] 4.2 Update README.md HTTPS row
- [x] 4.3 Scope Rule validation — zero domain files changed

## Test Results

| Gate | Result |
|------|--------|
| Safety Net (before any changes) | ✅ 56 files, 544 tests passing |
| RED Gate (after 1.1) | ✅ 56 files, 544 pass + 1 fail (expected) |
| Foundation Gate (after 2.2) | ✅ 56 files, 544 pass + 1 fail (expected) |
| GREEN Gate (after 3.1) | ✅ 56 files, 545 tests all passing |
| Final Regression (4.1) | ✅ 56 files, 545 tests all passing |
| `pnpm verify` (format+lint+typecheck+tests+build) | ✅ All green |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `src/App.test.tsx` | Unit | ✅ 544/544 | ✅ Written | ✅ Passed | ➖ Single (spec has one scenario for CSP directive) | ➖ None needed |
| 2.1 | N/A (dep install) | N/A | N/A | N/A | N/A | ➖ Skipped (config task, no logic) | N/A |
| 2.2 | `vite.config.ts` | N/A | ✅ 544/544 | N/A | N/A | ➖ Skipped (config task, no logic) | N/A |
| 3.1 | `index.html` | Infrastructure | N/A (TDD: test already written in 1.1) | N/A (RED was 1.1) | ✅ 545/545 | ➖ Skipped (binary: directive present or not) | ➖ None needed |
| 4.1 | N/A (regression) | N/A | N/A | N/A | N/A | N/A | N/A |
| 4.2 | `README.md` | N/A | N/A | N/A | N/A | ➖ Skipped (doc update) | N/A |
| 4.3 | N/A (scope check) | N/A | N/A | N/A | N/A | N/A | N/A |

### Triangulation Notes

- **Task 1.1/3.1**: Single spec scenario (REQ-2: CSP must contain `upgrade-insecure-requests`). The test is binary — the directive is either present or not. Triangulation skipped: single possible output, no branching logic.
- **Task 2.1**: Pure dependency installation — no code logic to test.
- **Task 2.2**: Pure configuration — no runtime logic to test.
- **Task 4.2**: Documentation update — no code logic to test.

## Files Changed

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `package.json` | Modified | +1 | Added `@vitejs/plugin-basic-ssl` devDependency |
| `pnpm-lock.yaml` | Modified | +13 | Lockfile update for new dependency |
| `vite.config.ts` | Modified | +2,-1 | Added `basicSsl` import + plugin entry |
| `index.html` | Modified | +1,-1 | Appended `upgrade-insecure-requests` to CSP |
| `src/App.test.tsx` | Modified | +8 | Added `?raw` import + AAA CSP test |
| `README.md` | Modified | +1,-1 | Updated HTTPS row with implementation details |

**Total**: 6 files, +26 / -3 lines (23 net additions)

## Scope Rule Validation

```
$ git diff --stat HEAD -- src/features/ src/shared/services/ src/shared/domain/ src/shared/stores/ src/shared/hooks/ src/infrastructure/
(no output — ZERO changes)
```

✅ All domain files under `src/features/`, `src/shared/`, and `src/infrastructure/` are untouched. Transport layer is infrastructure-only, complying with REQ-3 and REQ-4.

## Deviations from Design

None — implementation matches design exactly. One minor correction: import path uses `../index.html?raw` rather than the design's `../../index.html?raw` because the test file is at `src/App.test.tsx` (one level deep from root, not two).

## Issues Found

None.
