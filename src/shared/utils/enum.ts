export function defineEnum<const T extends Record<string, string>>(obj: T): T {
  return obj
}

export type ValuesOf<T> = T[keyof T]
