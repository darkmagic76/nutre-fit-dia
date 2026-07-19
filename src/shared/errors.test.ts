import { describe, it, expect } from 'vitest'
import { DomainError, ValidationError, NotFoundError } from './errors'

describe('DomainError', () => {
  it('has a code and message', () => {
    const err = new DomainError('something went wrong', 'TEST_ERROR', { id: 1 })
    expect(err.code).toBe('TEST_ERROR')
    expect(err.message).toBe('something went wrong')
    expect(err.context).toEqual({ id: 1 })
  })

  it('does not leak context into message', () => {
    const err = new DomainError('public message', 'TEST_ERROR', { secret: 'hidden' })
    expect(err.message).not.toContain('hidden')
    expect(err.message).not.toContain('secret')
  })
})

describe('ValidationError', () => {
  it('has VALIDATION_ERROR code', () => {
    const err = new ValidationError('invalid input', { field: 'weight' })
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toBe('invalid input')
  })

  it('is an instance of DomainError', () => {
    const err = new ValidationError('invalid')
    expect(err).toBeInstanceOf(DomainError)
    expect(err).toBeInstanceOf(Error)
  })
})

describe('NotFoundError', () => {
  it('has NOT_FOUND code', () => {
    const err = new NotFoundError('food not found', { id: 'nonexistent' })
    expect(err.code).toBe('NOT_FOUND')
  })

  it('is an instance of DomainError', () => {
    const err = new NotFoundError('missing')
    expect(err).toBeInstanceOf(DomainError)
  })
})
