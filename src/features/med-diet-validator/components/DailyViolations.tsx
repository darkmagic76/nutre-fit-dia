import { useT } from '@shared/i18n';
import { ViolationList } from '@shared/ui';
import { formatViolation } from '@shared/ui/formatters/formatViolation';
import type { ValidationResult } from '@shared/services/rationValidator';
import { VEGETABLE_NUDGE_HOUR_THRESHOLD } from '@shared/nudge';

interface DailyViolationsProps {
  validation: ValidationResult;
  hasFoods: boolean;
  /** Hour of day (0-23) for vegetable nudge time gate. Defaults to current hour for testability. */
  currentHour?: number;
}

export function DailyViolations({ validation, hasFoods, currentHour }: DailyViolationsProps) {
  const hour = currentHour ?? new Date().getHours();
  const t = useT();

  const vegetableDeficit = validation.violations.some(
    (v) => v.category === 'vegetables' && v.direction === 'under',
  );

  return (
    <>
      {!validation.valid && (
        <ViolationList
          violations={validation.violations.map((v) => ({
            message: formatViolation(t, v),
          }))}
          errorLabel={t['validation.label.errors']}
          warningLabel={t['validation.label.warnings']}
        />
      )}

      {vegetableDeficit && (
        <p className="text-amber-600 dark:text-amber-400 text-sm font-medium" role="status">
          {hour < VEGETABLE_NUDGE_HOUR_THRESHOLD
            ? t['violations.vegetableNudge.before2pm']
            : t['violations.vegetableNudge.after2pm']}
        </p>
      )}

      {validation.valid && hasFoods && (
        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium" role="status">
          {t['validation.allClear']}
        </p>
      )}

      {validation.animalProteinCount > 2 && (
        <ViolationList
          type="warning"
          violations={[
            {
              message: t['log.animalProteinWarning'].replace(
                '{count}',
                String(validation.animalProteinCount),
              ),
            },
          ]}
          errorLabel={t['validation.label.errors']}
          warningLabel={t['validation.label.warnings']}
        />
      )}
    </>
  );
}
