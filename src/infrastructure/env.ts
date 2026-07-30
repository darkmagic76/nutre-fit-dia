import { z } from 'zod';

const envSchema = z.object({
  VITE_STORAGE_PREFIX: z.string().min(1),
  VITE_BASE_URL: z.string().default('/'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env: Env = parsed.data;
