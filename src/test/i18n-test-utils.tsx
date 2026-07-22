import { render, type RenderOptions } from '@testing-library/react';
import { I18nProvider } from '@shared/i18n';
import { type ReactElement } from 'react';

export function renderWithI18n(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    ...options,
  });
}
