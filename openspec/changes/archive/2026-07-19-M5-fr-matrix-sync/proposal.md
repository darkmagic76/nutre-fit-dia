# Proposal: M5 FR-MATRIX Sync

## Intent

Synchronize `adr/FR-MATRIX-trazabilidad.md` with the real implementation state across all features. The matrix has fallen behind (e.g., TASKS.md still warns about RF-02 being stale), and no systematic audit has confirmed that every entry matches the code. This closes that gap.

## Scope

### In Scope
- Audit every FR/RF/RNF row against source code to confirm ✅/🔶/🔜 status
- Update stale dates, test counts, and coverage references
- Cross-check all SPEC_TECH entries against current implementation
- Add a last-verified timestamp per entry (optional, if useful)

### Out of Scope
- Any code changes, refactors, or bug fixes
- Implementing M6 (fortalecimiento) or M7 (fraccionamiento) — those remain deferred
- Adding new traceability rows for features that don't exist yet
- Changing the OpenSpec spec files (no spec-level behavior changes)

## Capabilities

> Documentation-only change. No spec-level behavior is being introduced or modified.

### New Capabilities
None

### Modified Capabilities
None

## Approach

1. **Row-by-row audit**: For each FR/RF/RNF row, search the codebase for the referenced implementation (service, component, schema, test file). Confirm the implementation exists and matches the description.
2. **SPEC_TECH cross-check**: Verify each SPEC_TECH row maps to actual code. Remove stale rows; mark pending items clearly as M6/M7 deferred.
3. **Update metadata**: Refresh date to 2026-07-19, test count if changed, commit hash if applicable.
4. **Commit**: Single conventional commit — `docs: sync FR-MATRIX with M1-M5 implementation state`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `adr/FR-MATRIX-trazabilidad.md` | Modified | Sync all 16 FR rows + 7 SPEC_TECH rows with real state |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlooking a partially implemented feature | Low | Cross-reference against TASKS.md + source imports |
| Matrix already correct, change is no-op | Medium | Still update date/metadata to mark last-verified |

## Rollback Plan

Single-file change — revert with `git revert <commit-hash>` or restore from `git checkout HEAD~1 -- adr/FR-MATRIX-trazabilidad.md`.

## Dependencies

- None (XS documentation change, no code or external dependencies)

## Success Criteria

- [ ] Every FR/RF/RNF entry confirmed ✅/🔶/🔜 matches current `src/` implementation
- [ ] All SPEC_TECH entries cross-checked against codebase
- [ ] Partial entries clearly document which milestone (M6/M7) resolves them
- [ ] Date updated to 2026-07-19
- [ ] TASKS.md note about stale matrix resolved (no warning remains)
