import { StatCard } from '@shared/ui';
import type { CaloricTargetOutput } from '@shared/services/caloricTargetService';
import { useT } from '@shared/i18n';

interface ProfileResultsProps {
  caloricTarget: CaloricTargetOutput;
}

export function ProfileResults({ caloricTarget }: ProfileResultsProps) {
  const t = useT();

  return (
    <div
      className="grid grid-cols-2 gap-3"
      aria-label="Resultados del perfil metabólico"
      aria-live="polite"
    >
      <StatCard label={t['metabolic.bmr']} value={`${caloricTarget.bmr} kcal`} />
      <StatCard label={t['metabolic.tdee']} value={`${caloricTarget.tdee} kcal`} />
      <StatCard
        label={t['metabolic.deficit']}
        value={`${caloricTarget.deficit} kcal`}
        variant={caloricTarget.restrictionActive ? 'danger' : 'default'}
        sub={caloricTarget.restrictionActive ? 'IMC > 25' : t['metabolic.noRestriction']}
      />
      <StatCard
        label={t['metabolic.target']}
        value={`${caloricTarget.target} kcal`}
        variant="success"
      />
    </div>
  );
}
