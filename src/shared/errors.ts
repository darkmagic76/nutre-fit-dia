/** Base error for all domain-level failures. Never exposes implementation details. */
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

/** Input data fails domain validation (wrong type, out of range, missing required field). */
export class ValidationError extends DomainError {
  constructor(message: string, context?: unknown) {
    super(message, 'VALIDATION_ERROR', context);
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
