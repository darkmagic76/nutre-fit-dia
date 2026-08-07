import { z } from 'zod';

export interface UserMetrics {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  physicalActivityFactor: number;
  imc: number;
  diagnosisAge: number;
}

export const UserProfileSchema = z.object({
  diagnosisAge: z.number().int().min(0).max(120),
  currentAge: z.number().int().min(18).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  gender: z.enum(['male', 'female']),
  physicalActivityFactor: z.number().min(1.0).max(2.5),
  imc: z.number().min(10).max(70),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
