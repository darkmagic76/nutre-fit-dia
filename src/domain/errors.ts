/**
 * Domain error codes — union type for all domain-level errors.
 *
 * These codes are used by use cases to return structured errors
 * without depending on i18n (Translations). The UI layer translates
 * these codes to user-facing messages.
 */
export type DomainErrorCode =
  | 'GLUCOSE_REQUIRED'
  | 'GLUCOSE_MUST_BE_POSITIVE'
  | 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE'
  | 'IMC_THRESHOLD_CROSSED'
  | 'INVALID_NUMERIC_INPUT';

/**
 * Base error for all domain-level failures. Never exposes implementation details.
 */
export class DomainError extends Error {
  readonly code: string;
  readonly context?: unknown;

  constructor(message: string, code: string, context?: unknown) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.context = context;
  }
}

/**
 * Input data fails domain validation.
 *
 * ## "validation" polysemy note
 *
 * This error represents **form/domain validation** — structural checks on raw user
 * input before any clinical processing:
 * - Wrong type (string where number expected)
 * - Out of range (age < 18 or > 120)
 * - Missing required field (empty glucose when calculating metabolic profile)
 *
 * Distinct from:
 * - **Ration-rule validation** (`src/domain/rationValidator.ts`):
 *   clinical rule checks against AESAN 2022 limits (e.g., cereals > 6/day)
 * - **UI violation display** (`src/features/med-diet-validator/components/
 *   DailyViolations.tsx`): rendering ration limit breaches as visual feedback
 *
 * {@link ValidationError} is NEVER used for ration-limit violations — it is
 * exclusively for user-input structural failures.
 *
 * ## Constructor overloads
 *
 * - `new ValidationError(message: string, context?: unknown)` — backward compat, code = 'VALIDATION_ERROR'
 * - `new ValidationError(code: DomainErrorCode, context?: unknown)` — new API, code = specific error code
 */
export class ValidationError extends DomainError {
  constructor(codeOrMessage: DomainErrorCode | string, context?: unknown) {
    // If it's a known DomainErrorCode, use it as both code and message
    // Otherwise, treat it as a message and use 'VALIDATION_ERROR' as code
    const isErrorCode = [
      'GLUCOSE_REQUIRED',
      'GLUCOSE_MUST_BE_POSITIVE',
      'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE',
      'IMC_THRESHOLD_CROSSED',
      'INVALID_NUMERIC_INPUT',
    ].includes(codeOrMessage);

    if (isErrorCode) {
      super(codeOrMessage, codeOrMessage, context);
    } else {
      super(codeOrMessage, 'VALIDATION_ERROR', context);
    }
    this.name = 'ValidationError';
  }
}

/** Requested entity does not exist in the domain (food not in catalog, profile not found). */
export class NotFoundError extends DomainError {
  constructor(message: string, context?: unknown) {
    super(message, 'NOT_FOUND', context);
    this.name = 'NotFoundError';
  }
}
