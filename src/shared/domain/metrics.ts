import { z } from 'zod'

export interface UserMetrics {
  weight: number
  height: number
  age: number
  gender: 'male' | 'female'
  physicalActivityFactor: number
  imc: number
  diagnosisAge: number
}

export const UserProfileSchema = z.object({
  diagnosisAge: z.number().int().min(0).max(120),
  currentAge: z.number().int().min(18).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  gender: z.enum(['male', 'female']),
  physicalActivityFactor: z.number().min(1.0).max(2.5),
  imc: z.number().min(10).max(70),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

export interface UserMetricsFormData {
  weight: string
  height: string
  age: string
  gender: 'male' | 'female'
  paf: string
  diagnosisAge: string
  glucose: string
  glucoseContext: 'fasting' | 'postprandial'
}

export interface UserMetricsFormSetters {
  setWeight: (v: string) => void
  setHeight: (v: string) => void
  setAge: (v: string) => void
  setGender: (v: string) => void
  setPaf: (v: string) => void
  setDiagnosisAge: (v: string) => void
  setGlucose: (v: string) => void
  setGlucoseContext: (v: 'fasting' | 'postprandial') => void
}

export interface UserMetricsFormState extends UserMetricsFormData, UserMetricsFormSetters {}
