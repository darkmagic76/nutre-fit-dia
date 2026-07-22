import type { Translations } from '@shared/i18n/types';

interface InstallPromptProps {
  isInstallable: boolean;
  onInstall: () => void;
  onDismiss: () => void;
  t: Translations;
}

export function InstallPrompt({ isInstallable, onInstall, onDismiss, t }: InstallPromptProps) {
  if (!isInstallable) return null;

  return (
    <div data-testid="install-prompt" className="flex gap-1">
      <button
        data-testid="install-button"
        onClick={onInstall}
        aria-label={t['install.title']}
        className="text-xs bg-emerald-700 hover:bg-emerald-600 text-emerald-200 px-3 py-1 rounded-full transition-colors"
      >
        ⬇️ {t['install.title']}
      </button>
      <button
        data-testid="dismiss-button"
        onClick={onDismiss}
        aria-label={t['install.dismiss']}
        className="text-xs bg-emerald-700 hover:bg-emerald-600 text-emerald-200 px-3 py-1 rounded-full transition-colors"
      >
        ✖ {t['install.dismiss']}
      </button>
    </div>
  );
}
