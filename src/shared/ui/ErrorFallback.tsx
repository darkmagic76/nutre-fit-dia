import type { ReactNode } from 'react';

export interface ErrorFallbackProps {
  title: string;
  description: string;
  buttonLabel: string;
  onRetry: () => void;
}

export function ErrorFallback({
  title,
  description,
  buttonLabel,
  onRetry,
}: ErrorFallbackProps): ReactNode {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950"
    >
      <div className="mb-2 text-red-600 dark:text-red-400 text-lg font-semibold" aria-hidden="true">
        !
      </div>
      <h2 className="text-lg font-bold text-red-700 dark:text-red-300">{title}</h2>
      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{description}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-red-600"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
