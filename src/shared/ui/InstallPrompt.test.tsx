import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallPrompt } from './InstallPrompt';
import type { Translations } from '@shared/i18n/types';

const baseT: Translations = {
  'app.title': '',
  'app.subtitle': '',
  'app.keyboardHint': '',
  'app.footer.tfm': '',
  'app.footer.disclaimer': '',
  'app.footer.security': '',
  'tab.scanner': '',
  'tab.log': '',
  'tab.metabolic': '',
  'tab.plan': '',
  'tab.activity': '',
  'tab.nudges': '',
  'tab.sustainability': '',
  'ui.scan': '',
  'ui.classify': '',
  'ui.addToLog': '',
  'ui.generatePlan': '',
  'ui.calculate': '',
  'ui.remove': '',
  'ui.selectFood': '',
  'ui.noSelection': '',
  'ui.violations': '',
  'ui.suggestions': '',
  'ui.caloricRestriction': '',
  'ui.activateRestriction': '',
  'ui.planValid': '',
  'ui.planViolations': '',
  'ui.day': '',
  'ui.foods': '',
  'ui.violationsCount': '',
  'scanner.title': '',
  'scanner.description': '',
  'scanner.emptySelection': '',
  'scanner.noFoodSelected': '',
  'log.title': '',
  'log.description': '',
  'log.emptyProfile': '',
  'log.dailyObjective': '',
  'log.noRestriction': '',
  'metabolic.title': '',
  'metabolic.description': '',
  'metabolic.bmr': '',
  'metabolic.tdee': '',
  'metabolic.deficit': '',
  'metabolic.target': '',
  'metabolic.restrictionActive': '',
  'metabolic.noRestriction': '',
  'metabolic.profileError': '',
  'plan.title': '',
  'plan.description': '',
  'activity.title': '',
  'activity.description': '',
  'activity.minutes': '',
  'activity.strength': '',
  'activity.compliance': '',
  'activity.streak': '',
  'activity.objectiveMet': '',
  'nudges.title': '',
  'nudges.description': '',
  'nudges.empty': '',
  'nudges.dismiss': '',
  'sustainability.title': '',
  'sustainability.description': '',
  'sustainability.scoring': '',
  'sustainability.scoringDesc': '',
  'sustainability.carbon': '',
  'sustainability.seasonality': '',
  'sustainability.proximity': '',
  'sustainability.zeroWaste': '',
  'sustainability.zeroWasteDesc': '',
  'sustainability.zeroWasteFooter': '',
  'sustainability.emissions': '',
  'sustainability.emissionsDesc': '',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.toggle': 'Toggle theme',
  'install.title': 'Install app',
  'install.dismiss': 'Dismiss',
  'legal.disclaimer': '',
  'form.weight': '',
  'form.height': '',
  'form.age': '',
  'form.diagnosisAge': '',
  'form.glucose': '',
  'form.gender': '',
  'form.genderMale': '',
  'form.genderFemale': '',
  'form.paf': '',
  'form.pafSedentary': '',
  'form.pafLight': '',
  'form.pafModerate': '',
  'form.pafActive': '',
  'form.pafVeryActive': '',
  'form.glucoseContext': '',
  'form.glucoseFasting': '',
  'form.glucosePostprandial': '',
};

describe('InstallPrompt', () => {
  it('renders install button when isInstallable=true', () => {
    render(
      <InstallPrompt isInstallable={true} onInstall={() => {}} onDismiss={() => {}} t={baseT} />,
    );
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('install-button')).toBeInTheDocument();
    expect(screen.getByTestId('dismiss-button')).toBeInTheDocument();
  });

  it('does not render when isInstallable=false', () => {
    render(
      <InstallPrompt isInstallable={false} onInstall={() => {}} onDismiss={() => {}} t={baseT} />,
    );
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('click dismiss calls onDismiss', () => {
    const onDismiss = vi.fn();
    render(
      <InstallPrompt isInstallable={true} onInstall={() => {}} onDismiss={onDismiss} t={baseT} />,
    );
    fireEvent.click(screen.getByTestId('dismiss-button'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
