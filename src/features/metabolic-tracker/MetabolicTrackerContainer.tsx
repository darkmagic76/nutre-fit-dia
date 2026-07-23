import { useTrackerStore } from '@shared/stores';
import { evaluateAndEnqueue } from '@shared/nudge';
import { MetabolicTrackerView } from './MetabolicTrackerView';
import type { FormEvent } from 'react';

export function MetabolicTrackerContainer() {
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

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    calculateTarget();
    // FR-4.3 / FR-5.1: re-evaluate nudges after recording glucose/weight biomarkers
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
    />
  );
}
