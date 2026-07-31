import type { Translations } from '@shared/i18n';
import { Card } from '@shared/ui';
import type { Food } from '@shared/domain';
import type { CaloricTargetOutput } from '@shared/services/caloricTargetService';
import type { ValidationResult } from '@shared/services/rationValidator';
import { CaloricSummary } from './components/CaloricSummary';
import { FoodList } from './components/FoodList';
import { DailyViolations } from './components/DailyViolations';

interface MedDietValidatorViewProps {
  todayLog: Food[];
  todayValidation: ValidationResult | null;
  caloricTarget: CaloricTargetOutput | null;
  totalKcal: number;
  onRemoveFood: (index: number) => void;
  translate: Translations;
}

export function MedDietValidatorView({
  todayLog,
  todayValidation,
  caloricTarget,
  totalKcal,
  onRemoveFood,
  translate: t,
}: MedDietValidatorViewProps) {
  return (
    <Card
      title={t['log.title']}
      description={
        caloricTarget
          ? `${t['log.dailyObjective']}: ${caloricTarget.target} kcal | ${Math.round(totalKcal)} kcal${caloricTarget.restrictionActive ? ` | ${t['metabolic.deficit']}: ${caloricTarget.deficit} kcal` : ''}`
          : t['log.description']
      }
    >
      {caloricTarget && <CaloricSummary caloricTarget={caloricTarget} totalKcal={totalKcal} />}

      {!caloricTarget && (
        <p className="text-amber-600 dark:text-amber-400 text-sm" role="status">
          <span aria-hidden="true">💡</span> {t['log.emptyProfile']}
        </p>
      )}

      <FoodList foods={todayLog} onRemove={onRemoveFood} />

      {todayValidation && (
        <DailyViolations validation={todayValidation} hasFoods={todayLog.length > 0} />
      )}
    </Card>
  );
}
