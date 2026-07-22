/**
 * Canonical sugar alias list — single source of truth.
 *
 * Union of patterns from occultSugarDetector.ts and MockScannerAdapter.ts.
 * Each consumer applies its own matching semantics (includes vs Set.has).
 */
export const SUGAR_ALIASES = [
  'azúcar',
  'azucar',
  'sacarosa',
  'sacarina',
  'jarabe',
  'glucosa',
  'fructosa',
  'dextrosa',
  'maltosa',
  'sirope',
  'melaza',
  'miel',
  'maltodextrina',
  'concentrado de zumo',
  'néctar',
  'nectar',
  'panela',
  'zumo concentrado',
  'zumo de fruta concentrado',
];
