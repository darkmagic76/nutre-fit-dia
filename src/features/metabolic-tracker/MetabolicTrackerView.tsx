import type { Translations } from '@shared/i18n';
import type { CaloricTargetOutput } from '../../domain/caloricTargetService';
import { Card } from '@shared/ui';
import type { ValidationError } from '@shared/errors';
import type { UserMetricsFormState } from '@shared/domain';
import type { FormEvent } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { ProfileError } from './components/ProfileError';
import { ProfileResults } from './components/ProfileResults';

interface MetabolicTrackerViewProps {
  form: UserMetricsFormState;
  caloricTarget: CaloricTargetOutput | null;
  profileError: ValidationError | null;
  canCalculate: boolean;
  onCalculate: (e: FormEvent) => void;
  translate: Translations;
  onExportData: () => void;
  isExporting: boolean;
}

export function MetabolicTrackerView({
  form,
  caloricTarget,
  profileError,
  canCalculate,
  onCalculate,
  translate: t,
  onExportData,
  isExporting,
}: MetabolicTrackerViewProps) {
  return (
    <Card title={t['metabolic.title']} description={t['metabolic.descriptionDetail']}>
      <ProfileForm form={form} onSubmit={onCalculate} canSubmit={canCalculate} />
      <ProfileError error={profileError} />
      {caloricTarget && <ProfileResults caloricTarget={caloricTarget} />}
      <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-700">
        <button
          onClick={onExportData}
          disabled={isExporting}
          className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline disabled:opacity-50 min-h-[44px] min-w-[44px]"
          aria-label={t['metabolic.exportData']}
        >
          {isExporting ? t['metabolic.exporting'] : t['metabolic.exportData']}
        </button>
        <p className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
          {t['legal.disclaimer']}
        </p>
      </div>
    </Card>
  );
}
