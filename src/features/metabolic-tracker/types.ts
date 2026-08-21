// Barrel re-export — GlucoseInput moved to domain/ per Scope Rule (ADR-001)
export { GlucoseInput } from '../../domain/glucoseInput';
// Note: `export { GlucoseInput }` exports both the branded TYPE and the
// constructor VALUE — TypeScript infers value + type from a single export.

/** UI form state for the metabolic tracker profile form. */
export interface UserMetricsFormData {
  weight: string;
  height: string;
  age: string;
  gender: 'male' | 'female';
  paf: string;
  diagnosisAge: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}

export interface UserMetricsFormSetters {
  setWeight: (v: string) => void;
  setHeight: (v: string) => void;
  setAge: (v: string) => void;
  setGender: (v: string) => void;
  setPaf: (v: string) => void;
  setDiagnosisAge: (v: string) => void;
  setGlucose: (v: string) => void;
  setGlucoseContext: (v: 'fasting' | 'postprandial') => void;
}

export interface UserMetricsFormState extends UserMetricsFormData, UserMetricsFormSetters {}
