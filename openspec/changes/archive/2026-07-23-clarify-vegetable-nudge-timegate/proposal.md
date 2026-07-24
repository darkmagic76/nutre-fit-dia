# Proposal: Clarify Vegetable Deficit Nudge Time Gate

## Intent

Before 2PM, users with zero vegetables see a deficit violation in `DailyViolations` but receive no nudge — because `REQ-VEGETABLES-DEFICIT` gates nudges on `currentHour >= 14`. There is zero UI explanation for this discrepancy. This change adds a contextual info line so users understand why the nudge hasn't fired yet and know they still have time to correct.

AESAN compliance: the AESAN 2022 report recommends vegetables "at least in one main meal" (comida/cena). Nudging before lunch is premature — this aligns with Spanish meal timing and PREDIMED patterns.

## Scope

### In Scope
- Export `VEGETABLE_NUDGE_HOUR_THRESHOLD` from `@shared/nudge` (it's currently module-scoped in `rules.ts`)
- Add conditional info line in `DailyViolations.tsx`: when a vegetable deficit exists AND `currentHour < 14`, render the i18n message
- Add i18n key `log.vegetableNudgeAfternoon` to `en.ts`, `es.ts`, and `types.ts`
- Add Vitest tests verifying the info line appears before 2PM with deficit, and hides after 2PM or without deficit

### Out of Scope
- Changing nudge logic or time gate threshold
- Modifying the violation/validator system
- Changing any existing nudge rule conditions
- Standalone nudge-status component or tooltip approach

## Capabilities

> Researched `openspec/specs/` — no spec-level requirements change.

### New Capabilities

None — this is a UI clarification of existing behavior.

### Modified Capabilities

None — `REQ-VEGETABLES-DEFICIT` in nudge-engine/spec.md defines the time gate already; this change only communicates it.

## Approach

**Approach A from exploration**: Augment `DailyViolations` with a conditional info line.

1. Export `VEGETABLE_NUDGE_HOUR_THRESHOLD` from `shared/nudge/index.ts`
2. In `DailyViolations.tsx`, after the violation list renders, compute `currentHour` via `new Date().getHours()`
3. If `validation.violations` contains a vegetable deficit (category VEGETABLES, `direction === 'under'`) AND `currentHour < 14`, render a subtle `<p>` with the i18n key `log.vegetableNudgeAfternoon`
4. Add the key to both locales and the `Translations` interface

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/nudge/index.ts` | Modified | Export `VEGETABLE_NUDGE_HOUR_THRESHOLD` (+1 line) |
| `src/shared/nudge/rules.ts` | Modified | Convert `const` to `export const` (+1 char) |
| `src/features/med-diet-validator/components/DailyViolations.tsx` | Modified | Add time-gate info logic (+10 lines) |
| `src/features/med-diet-validator/components/DailyViolations.test.tsx` | Modified | Test cases for new behavior (+20 lines) |
| `src/shared/i18n/en.ts` | Modified | New translation key (+2 lines) |
| `src/shared/i18n/es.ts` | Modified | New translation key (+2 lines) |
| `src/shared/i18n/types.ts` | Modified | New key type (+1 line) |

**Total**: ~37 lines across 7 files

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Time-gate changes break UI sync | Low | Import the constant from `@shared/nudge` — single source of truth. If threshold changes to 15, the UI follows. |
| i18n key missing in `es.ts` | Low | TypeScript enforces `Translations` interface parity. `tsc` fails if key is missing from either locale. |

## Rollback Plan

Revert the commit. No data mutations, no store changes, no API calls. Pure UI addition — safe to revert at any time.

## Dependencies

Requires `VEGETABLE_NUDGE_HOUR_THRESHOLD` exported from `@shared/nudge` (currently module-scoped in `rules.ts`). No external dependencies. No infrastructure changes.

## Success Criteria

- [ ] Info message visible before 2PM when a vegetable deficit violation exists
- [ ] Info message hidden after 2PM (nudge fires, no need for explanation)
- [ ] Info message hidden when no vegetable deficit (no violation to contextualize)
- [ ] Spanish locale shows "Los avisos de hortalizas se activan a partir de las 14:00 — aún tienes tiempo de incluir verduras en tus comidas."
- [ ] English locale shows equivalent EN text
- [ ] All existing tests pass; new tests cover the time-gate conditional
