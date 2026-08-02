import { useTrackerStore } from '@shared/stores';
import { useT } from '@shared/i18n';
import { useExportData } from '@shared/hooks/useExportData';
import { evaluateAndEnqueue } from '@shared/nudge';
import { MetabolicTrackerView } from './MetabolicTrackerView';
import type { FormEvent } from 'react';

export function MetabolicTrackerContainer() {
  const t = useT();
  const {
    weight,
    height,
    age,
    diagnosisAge,
    gender,
    paf,
    glucose,
    glucoseContext,
    caloricTarget,
    profileError,
    setWeight,
    setHeight,
    setAge,
    setDiagnosisAge,
    setGender,
    setPaf,
    setGlucose,
    setGlucoseContext,
    calculateTarget,
  } = useTrackerStore();
  const { exportAllData, isExporting } = useExportData();

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    calculateTarget();
    evaluateAndEnqueue();
  };

  const canCalculate = glucose.trim().length > 0;

  return (
    <MetabolicTrackerView
      form={{
        weight,
        height,
        age,
        diagnosisAge,
        gender,
        paf,
        glucose,
        glucoseContext,
        setWeight,
        setHeight,
        setAge,
        setDiagnosisAge,
        setGender,
        setPaf,
        setGlucose,
        setGlucoseContext,
      }}
      caloricTarget={caloricTarget}
      profileError={profileError}
      canCalculate={canCalculate}
      onCalculate={handleCalculate}
      translate={t}
      onExportData={exportAllData}
      isExporting={isExporting}
    />
  );
}
