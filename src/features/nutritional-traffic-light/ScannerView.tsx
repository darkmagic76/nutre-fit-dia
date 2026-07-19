import { TrafficLightColor, CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import type { Food } from '@shared/domain'
import { Card, SelectField, PrimaryButton, SafetyAlertDisplay } from '@shared/ui'
import type { ClassificationResult } from './services/classificationService'
import type { SafetyAlert } from '@shared/services/rationValidator'
import { useT } from '@shared/i18n'

const TRAFFIC_COLORS: Record<string, string> = {
  [TrafficLightColor.GREEN]: 'bg-emerald-500',
  [TrafficLightColor.ORANGE]: 'bg-amber-500',
  [TrafficLightColor.RED]: 'bg-red-500',
}

const TRAFFIC_LABELS: Record<string, string> = {
  [TrafficLightColor.GREEN]: 'Recomendable',
  [TrafficLightColor.ORANGE]: 'Moderación',
  [TrafficLightColor.RED]: 'Evitar',
}

interface ScannerViewProps {
  selectedId: string
  options: Array<{ value: string; label: string }>
  selected: Food | null
  result: ClassificationResult | null
  safetyAlerts: SafetyAlert[]
  onSelect: (id: string) => void
  onClassify: () => void
  onAddToLog: () => void
  onAcknowledgeAlert: (index: number) => void
}

export function ScannerView({
  selectedId,
  options,
  selected,
  result,
  safetyAlerts,
  onSelect,
  onClassify,
  onAddToLog,
  onAcknowledgeAlert,
}: ScannerViewProps) {
  const t = useT()

  return (
    <Card title={t['scanner.title']} description={t['scanner.description']}>
      <SelectField
        id="food-select"
        label={t['ui.selectFood']}
        value={selectedId}
        onChange={v => onSelect(v)}
        options={options}
        placeholder={t['scanner.emptySelection']}
      />

      {selected && (
        <div className="p-3 bg-stone-50 rounded-lg text-sm space-y-1" aria-label={`Detalles de ${selected.name}`}>
          <p><strong>{selected.name}</strong> — {CATEGORY_DISPLAY_NAMES[selected.category]}</p>
          <p>{selected.kcalPer100g} kcal | {selected.proteinPer100g}g prot | {selected.carbsPer100g}g HC | {selected.fatPer100g}g grasa</p>
          {selected.harmfulIngredients.length > 0 && (
            <p className="text-red-600" role="alert">⚠️ {selected.harmfulIngredients.join(', ')}</p>
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
          aria-label={`Clasificación: ${TRAFFIC_LABELS[result.color]}`}
        >
          <p className="text-xl font-bold">{TRAFFIC_LABELS[result.color]}</p>
          {result.reasons.map((r, i) => (
            <p key={i} className="text-sm mt-1 opacity-90">{r}</p>
          ))}
        </div>
      )}

      <SafetyAlertDisplay alerts={safetyAlerts} onAcknowledge={onAcknowledgeAlert} />
    </Card>
  )
}
