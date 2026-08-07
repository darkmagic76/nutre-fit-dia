import type { ValidationError } from '@domain/errors';
import { useT } from '@shared/i18n';

interface ProfileErrorProps {
  error: ValidationError | null;
}

function translateErrorCode(
  code: string,
  context: Record<string, unknown> | undefined,
  t: ReturnType<typeof useT>,
): string {
  switch (code) {
    case 'GLUCOSE_REQUIRED':
      return t['errors.glucoseRequiredForMetabolicProfile'];
    case 'GLUCOSE_MUST_BE_POSITIVE':
      return t['errors.glucoseMustBePositive'];
    case 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE':
      return t['errors.diagnosisAgeExceedsCurrentAge']
        .replace('{diagnosisAge}', String(context?.diagnosisAge ?? ''))
        .replace('{currentAge}', String(context?.currentAge ?? ''));
    case 'IMC_THRESHOLD_CROSSED':
      return context?.direction === 'crossed_above'
        ? t['errors.imcThresholdCrossedUp']
        : t['errors.imcThresholdCrossedDown'];
    case 'INVALID_NUMERIC_INPUT':
      return t['errors.processingError'].replace(
        '{message}',
        String(context?.error ?? 'Invalid input'),
      );
    default:
      return code;
  }
}

export function ProfileError({ error }: ProfileErrorProps) {
  const t = useT();
  if (!error) return null;
  const message = translateErrorCode(error.code, error.context as Record<string, unknown>, t);
  return (
    <p className="text-red-600 dark:text-red-400 text-sm font-medium" role="alert">
      {message}
    </p>
  );
}
