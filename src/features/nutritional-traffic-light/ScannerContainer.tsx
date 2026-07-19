import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from './services/classificationService'
import { checkSafetyAlerts } from './services/safetyCheck'
import { useLogStore } from '@features/med-diet-validator/store'
import { evaluateAndEnqueue } from '@features/nudge-engine'
import { ScannerView } from './ScannerView'
import type { SafetyAlert } from '@shared/services/rationValidator'

export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([])
  const addFoodToLog = useLogStore(s => s.addFoodToLog)

  const options = Array.from(foodsById.entries()).map(([id, food]) => ({
    value: id,
    label: `${food.name} ${food.isProcessed ? '⚠️' : ''}`,
  }))

  const selected = selectedId ? foodsById.get(selectedId) : null

  const handleClassify = () => {
    const food = selected!
    setResult(classifyFoodWithReasons(food))
    setSafetyAlerts(checkSafetyAlerts(food))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by UI (button disabled when null)
    evaluateAndEnqueue(selected!)
  }

  const handleAddToLog = () => {
    addFoodToLog(selected!)
    evaluateAndEnqueue()
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setResult(null)
    setSafetyAlerts([])
  }

  const handleAcknowledge = (index: number) => {
    setSafetyAlerts(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <ScannerView
      selectedId={selectedId}
      options={options}
      selected={selected ?? null}
      result={result}
      safetyAlerts={safetyAlerts}
      onSelect={handleSelect}
      onClassify={handleClassify}
      onAddToLog={handleAddToLog}
      onAcknowledgeAlert={handleAcknowledge}
    />
  )
}
