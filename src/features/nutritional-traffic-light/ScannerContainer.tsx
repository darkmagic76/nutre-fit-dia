import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from './services/classificationService'
import { TrafficLightColor } from '@shared/domain'
import { useAppStore } from '@shared/store/appStore'
import { Card, SelectField, PrimaryButton } from '@shared/ui/primitives'

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

const CATEGORY_NAMES: Record<string, string> = {
  cereals: 'Cereales', vegetables: 'Hortalizas', fruits: 'Frutas',
  olive_oil: 'AOVE', dairy: 'Lácteos', legumes: 'Legumbres',
  fish: 'Pescado', eggs: 'Huevos', white_meat: 'Carne blanca', water: 'Agua',
}

export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const addFoodToLog = useAppStore(s => s.addFoodToLog)

  const foodIds = Array.from(foodsById.keys())
  const options = foodIds.map(id => ({
    value: id,
    label: `${foodsById.get(id)!.name} ${foodsById.get(id)!.isProcessed ? '⚠️' : ''}`,
  }))

  const selected = selectedId ? foodsById.get(selectedId) : null

  const handleClassify = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  const handleAddToLog = () => {
    if (!selected) return
    addFoodToLog(selected)
  }

  return (
    <Card title="🔍 Semáforo Nutricional" description="Modelo Hospital Rey Juan Carlos. Azúcares ocultos o grasas trans → ROJO automático.">
      <SelectField
        id="food-select"
        label="Seleccionar alimento"
        value={selectedId}
        onChange={v => { setSelectedId(v); setResult(null) }}
        options={options}
        placeholder="— Seleccionar alimento —"
      />

      {selected && (
        <div className="p-3 bg-stone-50 rounded-lg text-sm space-y-1" aria-label={`Detalles de ${selected.name}`}>
          <p><strong>{selected.name}</strong> — {CATEGORY_NAMES[selected.category]}</p>
          <p>{selected.kcalPer100g} kcal | {selected.proteinPer100g}g prot | {selected.carbsPer100g}g HC | {selected.fatPer100g}g grasa</p>
          {selected.harmfulIngredients.length > 0 && (
            <p className="text-red-600" role="alert">⚠️ {selected.harmfulIngredients.join(', ')}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <PrimaryButton onClick={handleClassify} disabled={!selectedId}>
          Clasificar
        </PrimaryButton>
        <button
          onClick={handleAddToLog}
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
