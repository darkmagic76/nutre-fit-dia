import type { Translations } from '@shared/i18n/types';
import { ErrorFallback } from './ErrorFallback';

/**
 * Factory for ErrorBoundary fallback callbacks.
 *
 * Extracted from App.tsx to avoid 7 duplicate inline arrow functions
 * that would inflate function count and block 100% coverage.
 * Tested via createErrorFallback.test.tsx.
 */
export function createErrorFallback(t: Translations): (retry: () => void) => React.ReactNode {
  return (retry) => (
    <ErrorFallback
      title={t['error.boundary.title']}
      description={t['error.boundary.description']}
      buttonLabel={t['error.boundary.retry']}
      onRetry={retry}
    />
  );
}
