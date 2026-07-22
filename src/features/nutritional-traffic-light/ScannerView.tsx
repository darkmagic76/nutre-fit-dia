import { TrafficLightColor } from '@shared/domain';
import type { Food } from '@shared/domain';
import { Card, SelectField, PrimaryButton } from '@shared/ui';
import { SafetyAlertDisplay } from './components/SafetyAlertDisplay';
import type { ClassificationResult } from './services/classificationService';
import type { SafetyAlert } from '@shared/services/rationValidator';
import { useT } from '@shared/i18n';

const TRAFFIC_COLORS: Record<string, string> = {
  [TrafficLightColor.GREEN]: 'bg-emerald-500',
  [TrafficLightColor.ORANGE]: 'bg-amber-500',
  [TrafficLightColor.RED]: 'bg-red-500',
};

interface ScannerViewProps {
  selectedId: string;
  options: Array<{ value: string; label: string }>;
  selected: Food | null;
  selectedName?: string;
  result: ClassificationResult | null;
  safetyAlerts: SafetyAlert[];
  onSelect: (id: string) => void;
  onClassify: () => void;
  onAddToLog: () => void;
  onAcknowledgeAlert: (index: number) => void;
}

export function ScannerView({
  selectedId,
  options,
  selected,
  selectedName,
  result,
  safetyAlerts,
  onSelect,
  onClassify,
  onAddToLog,
  onAcknowledgeAlert,
}: ScannerViewProps) {
  const t = useT();
  const displayName = selectedName ?? selected?.name ?? '';

  const trafficLabel = (color: string) => {
    if (color === TrafficLightColor.GREEN) return t['scanner.trafficGreen'];
    if (color === TrafficLightColor.ORANGE) return t['scanner.trafficOrange'];
    return t['scanner.trafficRed'];
  };

  return (
    <Card title={t['scanner.title']} description={t['scanner.description']}>
      <SelectField
        id="food-select"
        label={t['ui.selectFood']}
        value={selectedId}
        onChange={(v) => onSelect(v)}
        options={options}
        placeholder={t['scanner.emptySelection']}
      />

      {selected && (
        <div
          className="p-3 bg-stone-50 dark:bg-zinc-700/60 rounded-lg text-sm space-y-1 dark:text-zinc-100"
          aria-label={t['scanner.detailsAria'].replace('{name}', displayName)}
        >
          <p>
            <strong>{displayName}</strong> —{' '}
            {t[`category.${selected.category}` as keyof typeof t] ?? selected.category}
          </p>
          <p>
            {t['scanner.macrosFormat']
              .replace('{kcal}', String(selected.kcalPer100g))
              .replace('{protein}', String(selected.proteinPer100g))
              .replace('{carbs}', String(selected.carbsPer100g))
              .replace('{fat}', String(selected.fatPer100g))}
          </p>
          {selected.harmfulIngredients.length > 0 && (
            <p className="text-red-600 dark:text-red-400" role="alert">
              ⚠️ {selected.harmfulIngredients.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <PrimaryButton onClick={onClassify} disabled={!selectedId}>
          {t['ui.classify']}
        </PrimaryButton>
        <PrimaryButton
          onClick={onAddToLog}
          disabled={!selectedId}
          className="bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-600"
          aria-label={t['ui.addToLog']}
        >
          + {t['tab.log']}
        </PrimaryButton>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg text-white ${TRAFFIC_COLORS[result.color]}`}
          role="status"
          aria-live="polite"
          aria-label={`Clasificación: ${trafficLabel(result.color)}`}
        >
          <p className="text-xl font-bold">{trafficLabel(result.color)}</p>
          {result.reasons.map((r, i) => (
            <p key={i} className="text-sm mt-1 opacity-90">
              {r}
            </p>
          ))}
        </div>
      )}

      <SafetyAlertDisplay alerts={safetyAlerts} onAcknowledge={onAcknowledgeAlert} />
    </Card>
  );
}
