import { ValidationError } from '@shared/errors'

const NUMERIC_RE = /^\d+(\.\d+)?$/

export function parseNumeric(value: string, max: number, min = 0): number {
  const cleaned = value.trim()

  if (!NUMERIC_RE.test(cleaned)) {
    const num = parseFloat(cleaned)
    if (Number.isNaN(num)) {
      throw new ValidationError('Valor numérico no válido', { value, max, min })
    }
    throw new ValidationError('Formato numérico incorrecto', { value, max, min })
  }

  const num = parseFloat(cleaned)
  if (num < min || num > max) {
    throw new ValidationError(`Valor fuera de rango [${min}-${max}]`, { value: num, max, min })
  }

  return num
}


