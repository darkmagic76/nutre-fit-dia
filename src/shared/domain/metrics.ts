export interface UserMetrics {
  weight: number
  height: number
  age: number
  gender: 'male' | 'female'
  physicalActivityFactor: number
  imc: number
}

export interface UserMetricsFormData {
  weight: string
  height: string
  age: string
  gender: 'male' | 'female'
  paf: string
}

export interface UserMetricsFormSetters {
  setWeight: (v: string) => void
  setHeight: (v: string) => void
  setAge: (v: string) => void
  setGender: (v: string) => void
  setPaf: (v: string) => void
}

export interface UserMetricsFormState extends UserMetricsFormData, UserMetricsFormSetters {}
