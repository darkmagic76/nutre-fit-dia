import { TrafficLightColor, CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import type { Food } from '@shared/domain'
import { Card, SelectField, PrimaryButton } from '@shared/ui/primitives'
import type { ClassificationResult } from './services/classificationService'

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
  onSelect: (id: string) => void
  onClassify: () => void
  onAddToLog: () => void
}

export function ScannerView({
  selectedId,
  options,
  selected,
  result,
  onSelect,
  onClassify,
  onAddToLog,
}: ScannerViewProps) {
  return (
    <Card title="🔍 Semáforo Nutricional" description="Modelo Hospital Rey Juan Carlos. Azúcares ocultos o grasas trans → ROJO automático.">
      <SelectField
        id="food-select"
        label="Seleccionar alimento"
        value={selectedId}
        onChange={v => onSelect(v)}
        options={options}
        placeholder="— Seleccionar alimento —"
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
          Clasificar
        </PrimaryButton>
        <button
          onClick={onAddToLog}
          disabled={!selectedId}
          className="flex-1 min-h-[44px] bg-amber-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition"
          aria-label="Añadir alimento al registro del día"
        >
          + Añadir al día
        </button>
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
    </Card>
  )
}
