import { useT } from '@shared/i18n';
import { StatCard } from '@shared/ui';
import type { CaloricTargetOutput } from '@shared/services/caloricTargetService';

interface CaloricSummaryProps {
  caloricTarget: CaloricTargetOutput;
  totalKcal: number;
}

export function CaloricSummary({ caloricTarget, totalKcal }: CaloricSummaryProps) {
  const t = useT();
  const ingested = Math.round(totalKcal);
  return (
    <div className="grid grid-cols-2 gap-2 mb-2" aria-label={t['caloric.dailyObjective']}>
      <StatCard
        label={t['caloric.dailyObjective']}
        value={`${caloricTarget.target} kcal`}
        variant="success"
      />
      <StatCard
        label="Ingerido"
        value={`${ingested} kcal`}
        variant={ingested > caloricTarget.target ? 'danger' : 'default'}
      />
    </div>
  );
}
