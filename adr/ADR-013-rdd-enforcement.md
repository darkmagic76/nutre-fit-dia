# ADR-013: Receipt-Driven Development Enforcement

**Status**: accepted
**Date**: 2026-08-21
**Deciders**: Architect (TFM maintainer)
**Context**: RDD was enabled globally but not enforced in the pre-commit hook, allowing commits without review receipts. This violated the agreed discipline and compromised code integrity for clinical/nutritional constants.

**Decision**: Integrate RDD receipt verification in the pre-commit hook (` .husky/pre-commit`). When RDD is enabled, the hook checks for a valid review receipt before allowing any commit. If no receipt exists, the commit is blocked with instructions to follow the review workflow.

**Pillars compliance**:

- Security by Design: ✅ Prevents unreviewed changes from entering the codebase, especially critical for clinical constants
- SRP + Modularity: ✅ Hook delegates to `gentle-ai review status` for receipt verification
- Domain Isolation: ✅ N/A (process enforcement, not domain logic)
- Organizational Scalability: ✅ Enforces consistent review discipline across all contributors

**Implementation**:

- Pre-commit hook checks `gentle-ai review mode status` for RDD state
- If enabled, runs `gentle-ai review status --next-transition` to verify receipt
- Blocks commit if no valid receipt found
- Bootstrapping exception: allows hook self-modification commits
- Quality gates (format, lint, typecheck, tests) run after receipt verification

**Consequences**:

- Easier: Ensures every change goes through review before commit
- Harder: Requires following RDD workflow for every commit (by design)
- RDD can be temporarily disabled with `gentle-ai review mode disable --scope clone` (not recommended)

**Related**: ADR-012 (Clean Architecture), WU6 (Process Discipline)
