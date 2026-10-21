# Verify Report: demo-reproducible-flow — Phase 4 (tasks 4.1–4.3)

## Scope

STRICT Phase 4 only: local commit `7feaf8c` (`e2e/demo.spec.ts` + `resetDemoStorage.test.ts`
hardening). All prior slices already verified — NOT re-judged here. Rollback (Phase 5)
explicitly out of scope. Read-only verification: zero edits, zero commits, zero pushes.

Judged against spec `§§ tests-and-gates`, `i18n` (e2e language toggle if covered), `rollback`
(not yet — Phase 5), and the spec e2e scenarios: 6-step offline path, replay,
exit-preserves-data, deep-link, drift-fails-loudly.

## Change under review

| Field | Value |
|---|---|
| Commit | `7feaf8c` test(demo): add offline 6-step e2e tour with replay/exit/deep-link |
| Files changed | `e2e/demo.spec.ts` (new, 115 lines) + `src/infrastructure/resetDemoStorage.test.ts` (+8/−1) |
| Changed lines | 123 insertions + 1 deletion = 124 (budget 400 — no exception needed) |
| Prod code changes | **Zero** (both files are test-only; `git show --stat` confirms) |

## Spec compliance matrix (Phase 4 scenarios)

| Spec scenario | E2E covering test | Result |
|---|---|---|
| Complete tour offline (steps 1–6, plan valido by step 6) | `demo.spec.ts:21` complete 6-step offline tour with domain-truth checks (`context.setOffline(true)` after load, seeded flag → BMR/TDEE → GREEN/RED → valid · 7 days → 1-3 alternatives → violations → 6× `Correcto`) | PASS |
| Replay from scratch (`resetDemo` + `seedDemo`, back to step 1) | `demo.spec.ts:73` replay resets the tour from scratch | PASS |
| Exit preserves data (no wipe; reopen shows guard) | `demo.spec.ts:91` exit preserves seeded data (overlay closes, reopen shows `ya hay datos guardados` confirm) | PASS |
| Visible entry (i18n button, no query param) | `demo.spec.ts:11` visible entry button opens the tour at step 1 | PASS |
| Deep-link `?demo=1` (secondary, opens at step 1, stripped) | `demo.spec.ts:107` deep-link opens tour and strips param (`not.toHaveURL(/demo=1/)`) | PASS |
| Clinical drift fails loudly (recomputed expected, e2e red) | Every step + summary assert `Falló` count 0 and summary `Correcto` count 6 — any threshold/food drift turns a check FAIL and this spec goes red by design | PASS (by construction) |
| Tests and gates (`e2e/demo.spec.ts` + unit tests; functions 100%; quality/verify/test:e2e green) | New spec + hardened unit test; gates re-run below | PASS |
| i18n (es+en keys; missing key fails typecheck/e2e toggle) | No demo-specific language-toggle test in this spec — covered by `Translations` type enforcement (`tsc -b`) + `DemoGuideView.test.tsx` es→en toggle (Phase 2C) + smoke en-toggle e2e (green). No gap. | PASS (via other gates) |
| IDB-unavailable hardening (design Error Handling row) | `resetDemoStorage.test.ts:40` stubs `indexedDB=undefined` on a FRESH module (`vi.resetModules` after stub, so module-level `indexedDBAvailable` genuinely re-evaluates), spies `console.warn` for `IndexedDB unavailable`, asserts prefixed-key clear still happens | PASS — genuine fallback exercise, not a vacuous resolve assert |

## Execution evidence (re-run by verifier, 2026-10-13)

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `pnpm vitest run src/infrastructure/resetDemoStorage.test.ts` | 1 file, 3/3 pass |
| `pnpm test:e2e -- demo` | 9/9 pass (5 new demo + 4 smoke; filter matched both spec files = full e2e suite, only 2 exist) |
| `pnpm quality` (format:check → oxlint → typecheck → test:run) | GREEN: prettier clean; oxlint 1 pre-existing warning (`DemoGuideContainer.tsx:47` only-export-components, from slice 2B, not this commit); `tsc -b` exit 0; 91 files / 985 tests pass |

## Conventions check

- E2E follows repo conventions: `getByRole` for all interactive elements (`button`, `dialog`, `heading`), `toBeVisible` asserts, mirrors `e2e/smoke.spec.ts` patterns. `getByText` used only for rendered content strings (seeded, BMR/TDEE, GREEN/RED, violations, `Correcto`/`Falló`) — correct usage.
- No `Tab` union change, no `fixtures.ts` import in prod (no prod touched at all), no store-direct imports (no prod touched at all).
- Offline set AFTER initial load (`page.goto` then `setOffline(true)`) so the dev-server page loads first — correct per PWA offline semantics.

## Issues

### CRITICAL

None.

### WARNING

None from this slice. Note (pre-existing, not Phase 4): oxlint `only-export-components`
warning on `DemoGuideContainer.tsx:47` dates from slice 2B; untouched by commit `7feaf8c`.

### SUGGESTION

- Optional follow-up (NOT a gate): add an `en`-locale step to `e2e/demo.spec.ts`
  (toggle language mid-tour, assert one translated heading) to give the demo tour its own
  e2e language-toggle pin. Currently covered at component level + smoke e2e; spec's i18n
  clause is satisfied via typecheck. Owner decision; fine to defer or decline.

## Verdict

**PASS** — Phase 4 complete: tasks 4.1–4.3 done, all 5 spec e2e scenarios covered by passing
runtime tests, zero prod-code blast radius (rollback = delete `e2e/demo.spec.ts` only),
full gates green (quality 91 files / 985 tests; e2e 9/9; `tsc -b` exit 0). No open warnings
from this slice. Next: Phase 5 (rollback note 5.1 + final checks 5.2), then archive.
