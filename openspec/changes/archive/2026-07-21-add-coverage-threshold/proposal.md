# Proposal: Add Coverage Threshold Enforcement

## Intent

`openspec/config.yaml` declares `rules.verify.coverage_threshold: 80` but Vitest has no threshold configuration — `pnpm test:coverage` reports coverage without enforcing a minimum. This change adds Vitest native coverage thresholds so CI/development will FAIL when coverage drops below 80%, making the declared policy enforceable.

## Scope

### In Scope
- Add coverage thresholds (statements, branches, functions, lines) to `vite.config.ts`
- Verify thresholds pass against current coverage
- Run full quality gate to confirm nothing breaks

### Out of Scope
- Any code changes outside `vite.config.ts`
- Changing the threshold percentage (stays at 80% per openspec config)
- Adding new tests or modifying test infrastructure

## Capabilities

### New Capabilities
- None — this is a pure config change, no new capability

### Modified Capabilities
- None — no spec-level behavior changes

## Approach

Add a `coverage` section to the existing `test` config in `vite.config.ts` with `provider: 'v8'` and `thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 }`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `vite.config.ts` | Modified | Add coverage configuration with thresholds |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Current coverage below threshold | Low | Verified current coverage is 87-94% across all categories |
| Breaking test:coverage command | Low | No structural change, only adding config keys |

## Rollback Plan

Revert the `coverage` block from `vite.config.ts` — git revert of a single-file change.

## Dependencies

None.

## Success Criteria

- [ ] `pnpm test:coverage` runs and enforces thresholds (exits 0 when above 80%)
- [ ] `pnpm test:run` continues to pass (510 tests)
- [ ] `pnpm quality` passes (lint + typecheck + test)
