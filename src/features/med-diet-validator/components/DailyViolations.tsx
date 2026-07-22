import { useT } from '@shared/i18n';
import { ViolationList } from '@shared/ui';
import type { ValidationResult } from '@shared/services/rationValidator';

interface DailyViolationsProps {
  validation: ValidationResult;
  hasFoods: boolean;
}

export function DailyViolations({ validation, hasFoods }: DailyViolationsProps) {
  const t = useT();

  return (
    <>
      {!validation.valid && <ViolationList violations={validation.violations} />}

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
        />
      )}
    </>
  );
}
