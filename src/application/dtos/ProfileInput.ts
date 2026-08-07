/** Input shape for the calculateTarget use case — raw form fields. */
export interface ProfileInput {
  weight: string;
  height: string;
  age: string;
  diagnosisAge: string;
  gender: 'male' | 'female';
  paf: string;
  glucose: string;
  glucoseContext: 'fasting' | 'postprandial';
}
