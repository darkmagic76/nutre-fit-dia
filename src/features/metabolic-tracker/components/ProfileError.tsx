import type { ValidationError } from '@shared/errors'

interface ProfileErrorProps {
  error: ValidationError | null
}

export function ProfileError({ error }: ProfileErrorProps) {
  if (!error) return null
  return (
    <p className="text-red-600 text-sm font-medium" role="alert">
      {error.message}
    </p>
  )
}
