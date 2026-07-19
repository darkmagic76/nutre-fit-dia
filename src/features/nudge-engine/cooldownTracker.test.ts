import { describe, it, expect } from 'vitest'
import { CooldownTracker } from './cooldownTracker'

describe('CooldownTracker', () => {
  describe('register / isOnCooldown', () => {
    it('blocks within cooldown window and allows after expiry', () => {
      // now() returns ms like Date.now; cooldownMinutes is in minutes
      let now = 0
      const tracker = new CooldownTracker(() => now)

      tracker.register('R1')

      // At t=0, still within 60-minute cooldown
      expect(tracker.isOnCooldown('R1', 60)).toBe(true)

      // At t = 61 * 60 * 1000ms (61 minutes), beyond cooldown
      now = 61 * 60 * 1000
      expect(tracker.isOnCooldown('R1', 60)).toBe(false)
    })

    it('returns false for an unknown rule id', () => {
      const tracker = new CooldownTracker()
      expect(tracker.isOnCooldown('unknown', 60)).toBe(false)
    })
  })

  describe('reset', () => {
    it('clears all entries when called without id', () => {
      let now = 0
      const tracker = new CooldownTracker(() => now)
      tracker.register('R1')
      tracker.register('R2')

      expect(tracker.isOnCooldown('R1', 60)).toBe(true)
      expect(tracker.isOnCooldown('R2', 60)).toBe(true)

      tracker.reset()

      // After reset, both should be unknown (not on cooldown)
      expect(tracker.isOnCooldown('R1', 60)).toBe(false)
      expect(tracker.isOnCooldown('R2', 60)).toBe(false)
    })

    it('clears a single entry when called with id', () => {
      let now = 0
      const tracker = new CooldownTracker(() => now)
      tracker.register('R1')
      tracker.register('R2')

      tracker.reset('R1')

      // R1 cleared, R2 still on cooldown
      expect(tracker.isOnCooldown('R1', 60)).toBe(false)
      expect(tracker.isOnCooldown('R2', 60)).toBe(true)
    })
  })

  it('defaults to Date.now when no factory is provided', () => {
    const tracker = new CooldownTracker()
    tracker.register('R-default')
    // With a large cooldown it should still be active right after registration
    expect(tracker.isOnCooldown('R-default', 1440)).toBe(true)
  })
})
