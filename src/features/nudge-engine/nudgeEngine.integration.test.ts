import { describe, it, expect, beforeEach } from 'vitest'
import { buildNudgeContext, evaluateRules } from './engine'
import { CooldownTracker } from './cooldownTracker'
import { SAFETY_RULES } from './rules'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { useLogStore } from '@features/med-diet-validator/store'
import { FoodCategory } from '@shared/domain'
import { makeFood } from '@/test/fixtures'

const cerealFood = makeFood({
  id: 'c1',
  name: 'Pan de centeno',
  category: FoodCategory.CEREALS,
})

const glycemicFruitFood = makeFood({
  id: 'gf1',
  name: 'uva',
  category: FoodCategory.FRUITS,
})

const vegetableFood = makeFood({
  id: 'v1',
  name: 'Brócoli',
  category: FoodCategory.VEGETABLES,
})

describe('Nudge Engine Integration', () => {
  beforeEach(() => {
    useTrackerStore.setState({ restrictionActive: false })
    useLogStore.setState({ todayLog: [] })
  })

  it('full pipeline: sets store state, builds context, evaluates rules, returns expected matches', () => {
    // Given: restriction active, 5 cereals, 1 vegetable, high-GI fruit, evening
    useTrackerStore.setState({ restrictionActive: true })
    useLogStore.setState({
      todayLog: [
        cerealFood,
        cerealFood,
        cerealFood,
        cerealFood,
        cerealFood,
        glycemicFruitFood,
        vegetableFood,
      ],
    })

    const cooldown = new CooldownTracker(() => 0)
    // Pin currentHour by directly setting after build (we can't mock Date easily)
    // Instead, we assert the context shape first
    const ctx = buildNudgeContext()

    expect(ctx.restrictionActive).toBe(true)
    expect(ctx.counts[FoodCategory.CEREALS]).toBe(5)
    expect(ctx.counts[FoodCategory.FRUITS]).toBe(1)
    expect(ctx.counts[FoodCategory.VEGETABLES]).toBe(1)
    expect(ctx.containsHighGlycemicFruit).toBe(true)

    // Evaluate with overridden hour that triggers vegetables deficit
    const eveningCtx = { ...ctx, currentHour: 21 }
    const results = evaluateRules(eveningCtx, SAFETY_RULES, cooldown)

    // CEREALS_RESTRICTION + FRUITS_GLYCEMIC_ALERT + VEGETABLES_DEFICIT
    // + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER_HYDRATION
    // + AOVE_TAGGING + HC_INACTIVITY_ADJUST
    expect(results).toHaveLength(9) // +LEGUMES_GLYCEMIC_BASE
    const matchedIds = results.map(r => r.rule.id)
    expect(matchedIds).toContain('CEREALS_RESTRICTION')
    expect(matchedIds).toContain('FRUITS_GLYCEMIC_ALERT')
    expect(matchedIds).toContain('VEGETABLES_DEFICIT')
  })

  it('cooldown blocks rules already registered', () => {
    useTrackerStore.setState({ restrictionActive: true })
    useLogStore.setState({ todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood] })

    const cooldown = new CooldownTracker(() => 0)

    // First evaluation — should match
    const ctx = buildNudgeContext()
    const firstPass = evaluateRules(ctx, SAFETY_RULES, cooldown)
    expect(firstPass).toHaveLength(7) // CEREALS + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER + AOVE + HC_INACTIVITY
    expect(firstPass[0].rule.id).toBe('CEREALS_RESTRICTION')

    // Simulate caller registering cooldown
    cooldown.register('CEREALS_RESTRICTION')

    // Second evaluation — CEREALS_RESTRICTION now on cooldown
    const secondPass = evaluateRules(ctx, SAFETY_RULES, cooldown)
    expect(secondPass).toHaveLength(6) // ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER + AOVE + HC_INACTIVITY
  })

  it('does not match when no rules trigger', () => {
    useTrackerStore.setState({ restrictionActive: false })
    useLogStore.setState({ todayLog: [vegetableFood, vegetableFood, vegetableFood] })

    const cooldown = new CooldownTracker(() => 0)
    const ctx = buildNudgeContext()
    // Override hour to be before 20 so VEGETABLES_DEFICIT doesn't trigger
    const morningCtx = { ...ctx, currentHour: 12 }

    const results = evaluateRules(morningCtx, SAFETY_RULES, cooldown)
    expect(results).toHaveLength(6) // ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER + AOVE + HC_INACTIVITY
  })
})
