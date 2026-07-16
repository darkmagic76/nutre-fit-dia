const NUMERIC_RE = /^\d+(\.\d+)?$/

export function sanitizeNumeric(value: string, max: number, min = 0): number {
  const cleaned = value.trim()
  if (!NUMERIC_RE.test(cleaned)) {
    const num = parseFloat(cleaned)
    if (Number.isNaN(num)) return min
    return Math.max(min, Math.min(num, max))
  }
  const num = parseFloat(cleaned)
  return Math.max(min, Math.min(num, max))
}
