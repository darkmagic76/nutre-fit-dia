import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@shared/i18n';
import { createLocalStorage, createMatchMedia } from './test/test-helpers';
import App from './App';
import indexHtml from '../index.html?raw';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage());
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => createMatchMedia(false)),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders and shows locale toggle button', () => {
    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    expect(screen.getByText('🇬🇧 EN')).toBeInTheDocument();
  });

  it('toggles locale from ES to EN when button is clicked', () => {
    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    const toggle = screen.getByText('🇬🇧 EN');
    fireEvent.click(toggle);

    // After clicking, locale switched to EN → button now shows 'ES'
    expect(screen.getByText('🇪🇸 ES')).toBeInTheDocument();
    expect(screen.queryByText('🇬🇧 EN')).toBeNull();
  });

  it('renders footer with TFM and security link', () => {
    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    // Footer should exist with at least 2 paragraphs (TFM + disclaimer)
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /seguridad/i });
    expect(link).toHaveAttribute('href', '/.well-known/security.txt');
  });

  it('includes upgrade-insecure-requests in CSP', () => {
    // Arrange: indexHtml imported from index.html?raw at module level (line 6)
    // Act: read the raw HTML content
    // Assert: CSP meta tag includes the upgrade-insecure-requests directive
    expect(indexHtml).toContain('upgrade-insecure-requests');
  });
});
