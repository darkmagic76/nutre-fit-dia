# ADR-001: Screaming Architecture + Scope Rule

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** darkmagic76 (project owner), gentle-orchestrator

## Context

The project needed an architectural style that immediately communicates its medical purpose (Type 2 Diabetes management) and prevents business logic from leaking across feature boundaries.

## Decision

Adopt **Screaming Architecture** with the **Scope Rule**:

1. **Screaming Architecture**: Feature directory names describe medical capabilities (e.g., `nutritional-traffic-light`, `metabolic-tracker`, `recipe-engine`), not technical layers.
2. **Scope Rule**: Code used by one feature → stays in that feature. Code used by 2+ features → moves to `shared/`. No exceptions without architectural approval.
3. **Container/Presentational Pattern**: Business logic containers are separate from UI presentational components. Container names match feature names.

## Consequences

- ✅ New developers understand the app's purpose from the directory structure alone
- ✅ Zero accidental cross-feature coupling
- ✅ Each feature can be tested, modified, or replaced independently
- ❌ Requires discipline to resist premature extraction to shared/

## Compliance

- `src/features/` contains only feature-scoped code
- `src/shared/` contains only cross-feature code (types, data, UI primitives)
- No circular dependencies between features
