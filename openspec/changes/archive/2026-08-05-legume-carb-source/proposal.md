# Proposal: Legume as Carbohydrate Source Nudge

## Intent

Add `LEGUME_CARB_SOURCE`, a daily informational nudge that educates users (especially T2D) that legumes are slow-digesting carbohydrates with lower glycemic impact that can complement cereal intake. Grounded in AESAN 2022: "Algunas de estas raciones de cereales pueden ser sustituidas por el consumo de legumbres, para completar la ingesta de hidratos de carbono" (L1368).

## Scope

### In Scope

- New `SafetyRule` entry `LEGUME_CARB_SOURCE` in `NUDGE_RULES` (BEHAVIORAL_NUDGE, INFO, COOLDOWN_6H)
- Condition: `counts[LEGUMES] > 0 && counts[CEREALS] < CEREAL_MIN_RATIONS`
- i18n keys `nudge.title.legumeCarbSource` + `nudge.body.legumeCarbSource` (es + en)
- Unit tests: boundary verification (legumes=0, cereals=3 exact), co-firing with CEREALS_DEFICIT, type/severity/cooldown
- Delta spec for nudge-engine domain (sdd-spec phase)

### Out of Scope

- Engine or NudgeContext changes (context already exposes both fields)
- New clinical constants (reuses `CEREAL_MIN_RATIONS`)
- UI changes (nudge panel already renders whatever rules return)

## Capabilities

> Research `openspec/specs/` before filling. This is the CONTRACT with sdd-spec.

### New Capabilities

None — infrastructure exists; this is a rule addition within the nudge-engine domain.

### Modified Capabilities

- `nudge-engine`: adds `REQ-LEGUME-CARB-SOURCE` requirement (new informational nudge rule).

## Approach

Data-driven rule addition — identical pattern to existing `CEREALS_DEFICIT`. Zero engine/context changes. Rule object placed in `NUDGE_RULES` array, semantically near `CEREALS_DEFICIT`. Default `COOLDOWN_6H` mirrors the deficit nudge; can be adjusted to `COOLDOWN_12H` or `COOLDOWN_24H` if lower frequency is preferred for purely educational content.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/nudge/rules.ts` | New entry | Add `LEGUME_CARB_SOURCE` to `NUDGE_RULES` |
| `src/features/nudge-engine/rules.test.ts` | New tests | Boundary + co-firing + type/severity/cooldown tests |
| `src/shared/i18n/types.ts` | New keys | `nudge.title.legumeCarbSource` + `nudge.body.legumeCarbSource` |
| `src/shared/i18n/es.ts` | New values | Spanish copy (UI language) |
| `src/shared/i18n/en.ts` | New values | English copy (interface parity) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Co-firing with CEREALS_DEFICIT confuses users | Low | Engine already supports multi-match; delta spec documents they are complementary |
| i18n parity break | Low | `Translations` interface enforces both languages at compile time |
| Normal Spanish vs. Latin American copy | Low | Use neutral/professional Spanish unless regional variant requested |

## Rollback Plan

Remove the rule entry from `NUDGE_RULES`, delete the two i18n keys from all 3 files, revert tests. No data migration, no engine state cleanup needed.

## Dependencies

- None (reuses `CEREAL_MIN_RATIONS` from `clinical.ts`, already imported)

## Success Criteria

- [ ] Rule fires when `legumes > 0 && cereals < 3`
- [ ] Rule does NOT fire at exact `cereals = 3` boundary
- [ ] Rule does NOT fire when `legumes = 0` (no legumes consumed today)
- [ ] Rule co-fires with `CEREALS_DEFICIT` (both appear when both conditions met)
- [ ] i18n keys resolve in both Spanish and English
- [ ] All existing tests pass — zero regression
