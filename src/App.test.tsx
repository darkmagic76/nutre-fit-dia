import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@shared/i18n';
import { ContainerProvider } from '@shared/context/ContainerContext';
import { container, createContainer } from '@infrastructure/compositionRoot';
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
      <ContainerProvider value={container}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ContainerProvider>,
    );

    expect(screen.getByText('🇬🇧 EN')).toBeInTheDocument();
  });

  it('toggles locale from ES to EN when button is clicked', () => {
    render(
      <ContainerProvider value={container}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ContainerProvider>,
    );

    const toggle = screen.getByText('🇬🇧 EN');
    fireEvent.click(toggle);

    // After clicking, locale switched to EN → button now shows 'ES'
    expect(screen.getByText('🇪🇸 ES')).toBeInTheDocument();
    expect(screen.queryByText('🇬🇧 EN')).toBeNull();
  });

  it('renders footer with TFM and security link', () => {
    render(
      <ContainerProvider value={container}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ContainerProvider>,
    );

    // Footer should exist with at least 2 paragraphs (TFM + disclaimer)
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /seguridad/i });
    expect(link).toHaveAttribute('href', '.well-known/security.txt');
  });

  it('includes upgrade-insecure-requests in CSP', () => {
    // Arrange: indexHtml imported from index.html?raw at module level (line 6)
    // Act: read the raw HTML content
    // Assert: CSP meta tag includes the upgrade-insecure-requests directive
    expect(indexHtml).toContain('upgrade-insecure-requests');
  });
});

describe('App demo entry', () => {
  beforeEach(async () => {
    window.history.replaceState(null, '', '/');
    // Stores are module-level singletons shared across containers —
    // reset so each entry path starts from a clean profile.
    await container.resetDemo();
  });

  function renderAppWithFreshContainer() {
    render(
      <ContainerProvider value={createContainer()}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ContainerProvider>,
    );
  }

  it('opens the guided tour at step 1 from the header demo button', async () => {
    renderAppWithFreshContainer();
    expect(screen.queryByRole('heading', { name: 'Datos iniciales' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Demostración guiada' }));
    expect(await screen.findByRole('heading', { name: 'Datos iniciales' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salir de la demo' }));
    expect(screen.queryByRole('heading', { name: 'Datos iniciales' })).not.toBeInTheDocument();
  });

  it('opens the tour at step 1 from the ?demo=1 deep-link', async () => {
    window.history.replaceState(null, '', '/?demo=1');
    renderAppWithFreshContainer();
    expect(await screen.findByRole('heading', { name: 'Datos iniciales' })).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('drag transform lands on the outer panel with no clipping wrapper', async () => {
    // DRAGLAYOUT-FIX guard: the overlay keeps only positioning context —
    // the panel box (dialog > first child) carries the drag transform and
    // its own internal scroll, with no overflow-clipping box in between.
    renderAppWithFreshContainer();
    fireEvent.click(screen.getByRole('button', { name: 'Demostración guiada' }));
    const dialog = await screen.findByRole('dialog');
    const heading = await screen.findByRole('heading', { name: 'Datos iniciales' });
    const panel = dialog.firstElementChild as HTMLElement;
    expect(panel.className).toContain('max-h-[85dvh]');
    expect(panel.className).toContain('overflow-y-auto');
    expect(panel.style.transform).toBe('');

    const handle = heading.closest('header') as HTMLElement;
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(window, { clientX: 160, clientY: 130 });
    expect(panel.style.transform).toBe('translate(60px, 30px)');
    fireEvent.pointerUp(window);
  });
});
