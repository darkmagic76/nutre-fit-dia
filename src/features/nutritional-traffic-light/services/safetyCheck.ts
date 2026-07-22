import type { Food } from '@shared/domain';
import type { SafetyAlert } from '@shared/services/rationValidator';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from '@shared/domain/glycemicFruits';

/**
 * Check a scanned food for safety concerns.
 * Returns SafetyAlert[] for high glycemic fruits (warning) and other clinical triggers.
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
    });
  }

  return alerts;
}
