import type { Food } from '@domain/food';
import type { SafetyAlert } from '../../../domain/rationValidator';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from '../../../domain/glycemicFruits';

/**
 * Check a scanned food for safety concerns.
 * Returns SafetyAlert[] for high glycemic fruits (warning) and other clinical triggers.
 *
 * ## Design note — dual pipeline for high-glycemic fruits
 *
 * This function runs at SCAN time (before the food enters the daily log).
 * It provides immediate feedback in the Nutritional Traffic Light panel.
 *
 * A parallel check exists in the Nudge Engine (`FRUITS_GLYCEMIC_ALERT` rule,
 * `src/shared/nudge/rules.ts`), which runs at LOG EVALUATION time — after
 * the food is already in today's log — and surfaces a SystemNotification in
 * the Nudge panel.
 *
 * Both use the same canonical data source (`HIGH_GLYCEMIC_FRUIT_NAMES` in
 * `@shared/domain/glycemicFruits.ts`). They are intentionally separate because
 * they serve different UX moments (pre-add warning vs post-add nudge).
 * Changing one without the other WILL cause clinical inconsistency.
 */
export function checkSafetyAlerts(food: Food): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  if (HIGH_GLYCEMIC_FRUIT_NAMES.has(food.name.toLowerCase())) {
    alerts.push({
      severity: 'warning',
      code: 'HIGH_GLYCEMIC_FRUIT',
      message: `${food.name}: fruta de alta carga glucémica — consumir con moderación`,
      category: food.category,
      acknowledgeRequired: true,
      foodName: food.name,
    });
  }

  return alerts;
}
