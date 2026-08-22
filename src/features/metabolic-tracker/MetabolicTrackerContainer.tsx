import { useMetabolicTrackerState } from './hooks/useMetabolicTrackerState';
import { useT } from '@shared/i18n';
import { useExportData } from '@shared/hooks/useExportData';
import { useNudgeTrigger } from '@infrastructure/hooks/useNudgeTrigger';
import { useContainer } from '@shared/context/useContainer';
import { MetabolicTrackerView } from './MetabolicTrackerView';
import type { FormEvent } from 'react';

export function MetabolicTrackerContainer() {
  const t = useT();
  const { biomarkerRepo } = useContainer();
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
  } = useMetabolicTrackerState();
  const { exportAllData, isExporting } = useExportData();
  const trigger = useNudgeTrigger();

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    calculateTarget(biomarkerRepo);
    trigger();
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
