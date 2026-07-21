import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@shared/i18n';
import { ErrorBoundary } from '@shared/ui';
import './index.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Fatal: #root element not found — cannot mount application');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary
      fallback={() => (
        <div
          role="alert"
          className="fixed inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-900 dark:bg-zinc-800 dark:text-zinc-100 p-6 text-center z-50"
        >
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">Algo salió mal</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 max-w-md">
            La aplicación encontró un error inesperado. Por favor, recargá la página para intentar
            de nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-emerald-700 px-6 py-3 text-white font-medium hover:bg-emerald-800 transition-colors"
          >
            Recargar aplicación
          </button>
        </div>
      )}
    >
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
