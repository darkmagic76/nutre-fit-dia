# Delta: No Functional Spec Changes

## Purpose

Document the spec-phase evaluation for `fix-audit-docs`. This change is pure documentation and configuration remediation — it modifies zero functional behavior. No spec-level requirement or scenario changes are required.

## Scope Audit

Three candidate specs were evaluated for potential deltas and verified as not needing modification:

| Spec | Evaluation |
|------|-----------|
| `coverage-threshold` | Spec mandates ≥80% functions. `vite.config.ts` self-imposes 100%. 100 ≥ 80 → fully compliant. Config is stricter than spec minimum, which is permitted by the MUST ≥80% constraint. No delta. |
| `pwa-service-worker` | Supabase runtime caching references already removed (pre-SDD fix #2). Current spec states `runtimeCaching: []` per ADR-011. No delta. |
| `https-transport` | Zero Supabase CSP references. CSP only covers `upgrade-insecure-requests`. No delta. |

## Requirements

### Requirement: No functional spec modifications

This change SHALL NOT modify any requirement or scenario in any existing OpenSpec spec. All 28 specs remain unchanged.

#### Scenario: All specs pass unaffected

- GIVEN the `fix-audit-docs` change scope (README CI diagram, coverage test, `.gitignore`, `TASKS.md` archive)
- WHEN the SDS spec phase completes
- THEN zero spec files under `openspec/specs/` SHALL be modified
- AND `pnpm test:coverage` SHALL continue to meet or exceed all threshold requirements

#### Scenario: Coverage threshold compliance unaffected

- GIVEN `coverage-threshold` spec requires ≥80% for statements, branches, functions, lines
- WHEN `vite.config.ts` has `functions: 100` and all other thresholds at 80
- THEN the configuration complies with spec minimums
- AND the self-imposed 100% functions threshold is not a spec violation (≥80% is the requirement)

#### Scenario: No new capabilities introduced

- GIVEN the `fix-audit-docs` proposal declares zero New Capabilities and zero Modified Capabilities
- WHEN the delta spec phase evaluates all 28 existing specs
- THEN no ADDED, MODIFIED, or REMOVED requirement blocks are generated
