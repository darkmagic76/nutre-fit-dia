import { useState } from 'react';
import { foodsById } from '@shared/data/foods';
import { classifyFoodWithReasons } from './services/classificationService';
import { checkSafetyAlerts } from './services/safetyCheck';
import { useLogStore } from '@shared/stores';
import { evaluateAndEnqueue } from '@shared/nudge';
import { useFoodName } from '@shared/hooks/useFoodName';
import { ScannerView } from './ScannerView';
import type { SafetyAlert } from '@shared/services/rationValidator';

export function NutritionalTrafficLightContainer() {
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const addFoodToLog = useLogStore((s) => s.addFoodToLog);
  const getFoodName = useFoodName;

  const options = Array.from(foodsById.entries()).map(([id, food]) => ({
    value: id,
    label: `${getFoodName(food)} ${food.isProcessed ? '⚠️' : ''}`,
  }));

  const selected = selectedId ? foodsById.get(selectedId) : null;

  const handleClassify = () => {
    if (!selected) return;
    setResult(classifyFoodWithReasons(selected));
    setSafetyAlerts(checkSafetyAlerts(selected));
    evaluateAndEnqueue(selected);
  };

  const handleAddToLog = () => {
    if (!selected) return;
    addFoodToLog(selected);
    evaluateAndEnqueue();
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setResult(null);
    setSafetyAlerts([]);
  };

  const handleAcknowledge = (index: number) => {
    setSafetyAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ScannerView
      selectedId={selectedId}
      options={options}
      selected={selected ?? null}
      selectedName={selected ? getFoodName(selected) : undefined}
      result={result}
      safetyAlerts={safetyAlerts}
      onSelect={handleSelect}
      onClassify={handleClassify}
      onAddToLog={handleAddToLog}
      onAcknowledgeAlert={handleAcknowledge}
    />
  );
}
