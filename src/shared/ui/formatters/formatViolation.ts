import type { Translations } from '@shared/i18n/types';
import type { RationViolation, SafetyAlert } from '@shared/services/rationValidator';

// ─── Shared interpolation ────────────────────────────────────────────────

/**
 * Replace `{key}` placeholders in a template string with the corresponding
 * values from the replacements record.
 */
function interpolate(template: string, replacements: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

// ─── formatViolation ─────────────────────────────────────────────────────

/**
 * Format a ration violation for display using i18n templates.
 *
 * For regular violations, combines the category key (`category.xxx`),
 * the direction-based message template, and the unit key.
 * For cross-category violations with a `messageKey`, returns the
 * translated string directly.
 */
export function formatViolation(t: Translations, v: RationViolation): string {
  if (v.messageKey) {
    return t[v.messageKey];
  }

  const catKey = `category.${v.category}` as keyof Translations;
  const msgKey = v.direction === 'under' ? 'validation.message.under' : 'validation.message.over';
  const unitKey = v.unit === 'day' ? 'validation.unitDay' : 'validation.unitWeek';

  const msg = interpolate(t[msgKey], {
    current: String(v.current),
    limit: String(v.limit),
    unit: t[unitKey],
  });

  return `${t[catKey]}: ${msg}`;
}

// ─── formatSafetyAlert ───────────────────────────────────────────────────

const SAFETY_ALERT_KEY_MAP: Record<string, keyof Translations> = {
  PORTION_TOO_SMALL: 'validation.safety.portionTooSmall',
  PORTION_TOO_LARGE: 'validation.safety.portionTooLarge',
  HIGH_GLYCEMIC_FRUIT: 'validation.safety.highGlycemicFruit',
};

/**
 * Format a safety alert for display using i18n templates.
 *
 * Maps `alert.code` to a `validation.safety.*` i18n key and replaces
 * template placeholders (`{name}`, `{grams}`, `{min}`, `{max}`) with
 * the alert's structured data fields.
 * Falls back to `alert.message` for unknown codes.
 */
export function formatSafetyAlert(t: Translations, alert: SafetyAlert): string {
  const key = SAFETY_ALERT_KEY_MAP[alert.code];
  if (!key) return alert.message;

  const replacements: Record<string, string> = {};
  if (alert.foodName) replacements.name = alert.foodName;
  if (alert.actualGrams !== undefined) replacements.grams = String(alert.actualGrams);
  if (alert.standardMin !== undefined) replacements.min = String(alert.standardMin);
  if (alert.standardMax !== undefined) replacements.max = String(alert.standardMax);

  return interpolate(t[key], replacements);
}
