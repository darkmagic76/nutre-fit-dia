## Exploration: Coverage Threshold Enforcement

### Current State
- `openspec/config.yaml` specifies `rules.verify.coverage_threshold: 80` and `testing.coverage: true`
- `vite.config.ts` has a `test` section with `globals`, `environment`, `setupFiles`, `css`, and `exclude` — but **NO coverage or threshold configuration**
- `@vitest/coverage-v8` is already installed as a dependency
- `pnpm test:coverage` runs successfully and produces coverage reports, but does NOT enforce any minimum thresholds
- Current actual coverage: Statements 93.16%, Branches 89.06%, Functions 87.30%, Lines 94.30% — all above 80%

### Affected Areas
- `vite.config.ts` — needs coverage thresholds added to the `test` section

### Approaches
1. **Vitest thresholds in vite.config.ts** — Add `thresholds` under `test.coverage` in vite.config.ts
   - Pros: Single file change, uses native Vitest API, enforced at `pnpm test:coverage` runtime
   - Cons: None
   - Effort: Low

2. **Custom script or CI gate** — Add a separate check script post-coverage
   - Pros: Decoupled from vitest config
   - Cons: Extra maintenance, more moving parts, redundant with native vitest support
   - Effort: Medium

### Recommendation
Approach 1: Add Vitest native coverage thresholds directly in `vite.config.ts`. This is the simplest, most maintainable approach and uses Vitest's built-in `thresholds` API. No additional dependencies or scripts needed.

### Risks
- None — current coverage exceeds thresholds by a wide margin
- If coverage drops below 80% in a future change, CI will fail — this is the DESIRED behavior

### Ready for Proposal
Yes — straightforward config change, no ambiguity.
