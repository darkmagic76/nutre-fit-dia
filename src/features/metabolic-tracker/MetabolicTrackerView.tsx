import { useT } from '@shared/i18n';
import type { CaloricTargetOutput } from '@shared/services/caloricTargetService';
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
}

export function MetabolicTrackerView({
  form,
  caloricTarget,
  profileError,
  canCalculate,
  onCalculate,
}: MetabolicTrackerViewProps) {
  const t = useT();
  return (
    <Card title={t['metabolic.title']} description={t['metabolic.descriptionDetail']}>
      <ProfileForm form={form} onSubmit={onCalculate} canSubmit={canCalculate} />
      <ProfileError error={profileError} />
      {caloricTarget && <ProfileResults caloricTarget={caloricTarget} />}
    </Card>
  );
}
