import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useT } from '@shared/i18n';
import { createErrorFallback } from './createErrorFallback';

describe('createErrorFallback', () => {
  function Harness() {
    const t = useT();
    const retry = vi.fn();
    const fallback = createErrorFallback(t);
    return <div>{fallback(retry)}</div>;
  }

  function renderHarness() {
    return render(
      <I18nProvider>
        <Harness />
      </I18nProvider>,
    );
  }

  it('renders ErrorFallback with translated title (ES default)', () => {
    renderHarness();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('renders ErrorFallback with translated description (ES default)', () => {
    renderHarness();
    expect(screen.getByText(/error inesperado/)).toBeInTheDocument();
  });

  it('renders retry button with translated label (ES default)', () => {
    renderHarness();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const retry = vi.fn();
    function Caller() {
      const t = useT();
      const fallback = createErrorFallback(t);
      return <div>{fallback(retry)}</div>;
    }

    render(
      <I18nProvider>
        <Caller />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
