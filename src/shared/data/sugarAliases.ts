/**
 * Canonical sugar alias list — re-exported from the domain layer.
 *
 * Nutrition vocabulary data lives in `@domain/classification` (domain must
 * not import from shared). This module keeps the historical import path
 * working for the scanner adapter (`MockScannerAdapter`).
 */
export { SUGAR_ALIASES } from '@domain/classification';
