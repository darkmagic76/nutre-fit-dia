/**
 * Canonical list of high-glycemic fruits per INFORME_ADR §2 and SPECS_TECH §4.
 *
 * ⚠️ IMPORTANT: AESAN 2022 (p.326) states that fruits are "hidratos de carbono de bajo
 * índice glucémico". This set contradicts that generalization and is based on external
 * GI tables (Atkinson FS et al., 2008, Diabetes Care 31(12):2281–2283), not AESAN.
 *
 * These fruits trigger safety alerts (safetyCheck) and nudge warnings
 * (FRUITS_GLYCEMIC_ALERT rule) when consumed.
 *
 * Values MUST be lowercase to match `food.name.toLowerCase()` lookups.
 * The food catalog uses capitalized names (e.g., 'Uvas'), so consumers
 * MUST normalize via `.toLowerCase()` before checking membership.
 */
export const HIGH_GLYCEMIC_FRUIT_NAMES: ReadonlySet<string> = new Set([
  'uvas', // Uvas — catalog entry fruit-uvas
  'dátiles', // Dátiles — high glycemic, per INFORME_ADR §2
  'higos', // Higos — high glycemic, per INFORME_ADR §2
  'uvas pasas', // Pasas — concentrated sugar
  'plátano maduro', // Ripe banana — high GI, clinical concern
]);
