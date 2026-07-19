import { describe, it, expect, vi } from 'vitest'
import { render, screen, type RenderOptions } from '@testing-library/react'
import { PlanView } from './PlanView'
import { FoodCategory, food } from '@shared/domain'
import { MealType, type WeeklyPlan } from './services/planGenerator'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { I18nProvider } from '@shared/i18n'
import { type ReactElement } from 'react'

function renderPlan(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>, ...options })
}

const lentejas = food({
  id: 'legume-lentejas', name: 'Lentejas', category: FoodCategory.LEGUMES,
  gramsPerRation: 60, kcalPer100g: 340, proteinPer100g: 24, carbsPer100g: 54,
  fiberPer100g: 11, fatPer100g: 1.5, carbonFootprint: 0.8, isSeasonal: true,
  culturalMetadata: { traditionalCuisine: true, socialEating: true, cookingTechnique: 'stew' as const, erMedDiet: true },
})

const invalidPlan: WeeklyPlan = {
  days: [{ day: 1, entries: [] }, { day: 2, entries: [] }],
  dailyResults: [
    {
      valid: false,
      violations: [
        {
          category: FoodCategory.CEREALS,
          current: 10,
          limit: 6,
          direction: 'over',
          unit: 'day',
          message: 'cereals: 10 raciones (máx 6/día)',
        },
      ],
      animalProteinCount: 0,
    },
    {
      valid: true,
      violations: [],
      animalProteinCount: 0,
    },
  ],
  weeklyResult: {
    valid: false,
    violations: [
      {
        category: FoodCategory.LEGUMES,
        current: 1,
        limit: 4,
        direction: 'under',
        unit: 'week',
        message: 'legumes: 1 raciones (mín 4/semana)',
      },
    ],
    animalProteinCount: 0,
  },
  valid: false,
}

describe('PlanView', () => {
  const defaultProps = {
    restrictionActive: false,
    weeklyPlan: null as WeeklyPlan | null,
    onToggleRestriction: vi.fn(),
    onGeneratePlan: vi.fn(),
  }

  it('renders checkbox and generate button', () => {
    renderPlan(<PlanView {...defaultProps} />)
    expect(screen.getByLabelText(/activar restricción calórica/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar plan/i })).toBeInTheDocument()
  })

  it('displays valid plan status', () => {
    const validPlan: WeeklyPlan = {
      ...invalidPlan,
      valid: true,
      weeklyResult: { ...invalidPlan.weeklyResult, valid: true, violations: [] },
      dailyResults: [{ ...invalidPlan.dailyResults[0], valid: true, violations: [] }],
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={validPlan} />)
    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Plan válido')
  })

  it('displays weekly violations for invalid plan', () => {
    renderPlan(<PlanView {...defaultProps} weeklyPlan={invalidPlan} />)
    const alerts = screen.getAllByRole('alert')
    const alertTexts = alerts.map(a => a.textContent).join(' ')
    expect(alertTexts).toContain('Violaciones detectadas')
    expect(alertTexts).toContain('legumes: 1 raciones')
  })

  it('displays daily violation details', () => {
    renderPlan(<PlanView {...defaultProps} weeklyPlan={invalidPlan} />)
    expect(screen.getByText('Día 1: 1 violaciones')).toBeInTheDocument()
    expect(screen.getByText('cereals: 10 raciones (máx 6/día)')).toBeInTheDocument()
  })

  it('shows cultural badges for foods with UNESCO metadata', () => {
    const culturalPlan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: lentejas, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={culturalPlan} />)
    // Badges should appear for traditional cuisine, social eating, and erMedDiet
    expect(screen.getByLabelText('Cocina tradicional')).toBeInTheDocument()
    expect(screen.getByLabelText('Comida en compañía')).toBeInTheDocument()
    expect(screen.getByLabelText('erMedDiet')).toBeInTheDocument()
  })

  it('shows social eating text when socialEating is true', () => {
    const culturalPlan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: lentejas, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={culturalPlan} />)
    expect(screen.getByText('Ideal para comer en compañía')).toBeInTheDocument()
  })

  it('shows cooking technique label when cookingTechnique is set', () => {
    const culturalPlan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: lentejas, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={culturalPlan} />)
    expect(screen.getByText('Preparación: guiso tradicional')).toBeInTheDocument()
  })

  it.each([
    ['stew', 'guiso tradicional'],
    ['steam', 'al vapor'],
    ['boiled', 'hervido'],
    ['grilled', 'a la plancha'],
    ['raw', 'en crudo'],
  ])('renders correct label for cooking technique: %s → %s', (technique, label) => {
    const cooked = food({
      id: `test-${technique}`, name: `Test ${technique}`, category: FoodCategory.LEGUMES,
      gramsPerRation: 60, kcalPer100g: 340, proteinPer100g: 24, carbsPer100g: 54,
      fiberPer100g: 11, fatPer100g: 1.5, carbonFootprint: 0.8, isSeasonal: true,
      culturalMetadata: { traditionalCuisine: true, cookingTechnique: technique as 'stew' | 'steam' | 'boiled' | 'grilled' | 'raw', erMedDiet: true },
    })
    const plan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: cooked, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
    expect(screen.getByText(`Preparación: ${label}`)).toBeInTheDocument()
  })

  it('does not show social eating or cooking text when flags are false', () => {
    // food with culturalMetadata but socialEating: false and no cookingTechnique
    const soloTraditional = food({
      id: 'fish-sardinas', name: 'Sardinas', category: FoodCategory.FISH,
      gramsPerRation: 100, kcalPer100g: 208, proteinPer100g: 25, carbsPer100g: 0,
      fiberPer100g: 0, fatPer100g: 11, carbonFootprint: 3.5, isSeasonal: true,
      culturalMetadata: { traditionalCuisine: true, socialEating: false, erMedDiet: true },
    })
    const plan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: soloTraditional, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
    // Emoji for traditional cuisine still renders
    expect(screen.getByLabelText('Cocina tradicional')).toBeInTheDocument()
    // Text spans must NOT appear
    expect(screen.queryByText('Ideal para comer en compañía')).not.toBeInTheDocument()
    expect(screen.queryByText(/Preparación:/)).not.toBeInTheDocument()
  })

  describe('ZeroWasteBadges', () => {
    const zeroWasteFood = food({
      id: 'test-zw', name: 'Zero Waste Food', category: FoodCategory.VEGETABLES,
      gramsPerRation: 100, kcalPer100g: 50, proteinPer100g: 2,
      carbsPer100g: 10, fiberPer100g: 1, fatPer100g: 0.5,
      carbonFootprint: 0.2, isSeasonal: true,
      isZeroWaste: true,
    })

    const uglyProduceFood = food({
      id: 'test-ugly', name: 'Ugly Produce Food', category: FoodCategory.FRUITS,
      gramsPerRation: 150, kcalPer100g: 52, proteinPer100g: 0.3,
      carbsPer100g: 14, fiberPer100g: 2.4, fatPer100g: 0.2,
      carbonFootprint: 0.3, isSeasonal: true,
      isUglyProduce: true,
    })

    function buildPlan(foodItem: typeof zeroWasteFood): WeeklyPlan {
      return {
        days: [{ day: 1, entries: [{ food: foodItem, rations: 1 }] }],
        dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
        weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
        valid: true,
      }
    }

    it('renders ♻️ badge when isZeroWaste is true', () => {
      renderPlan(<PlanView {...defaultProps} weeklyPlan={buildPlan(zeroWasteFood)} />)
      expect(screen.getByLabelText('Zero Waste')).toBeInTheDocument()
      expect(screen.getByTitle('Zero Waste')).toBeInTheDocument()
    })

    it('renders 🥕 badge when isUglyProduce is true', () => {
      renderPlan(<PlanView {...defaultProps} weeklyPlan={buildPlan(uglyProduceFood)} />)
      expect(screen.getByLabelText('KM0')).toBeInTheDocument()
      expect(screen.getByTitle('KM0 / Defectos estéticos')).toBeInTheDocument()
    })

    it('renders no badges when both flags are false', () => {
      const plainFood = food({
        id: 'test-plain', name: 'Plain Food', category: FoodCategory.CEREALS,
        gramsPerRation: 50, kcalPer100g: 240, proteinPer100g: 8,
        carbsPer100g: 42, fiberPer100g: 7, fatPer100g: 2,
        carbonFootprint: 0.8, isSeasonal: true,
      })
      renderPlan(<PlanView {...defaultProps} weeklyPlan={buildPlan(plainFood)} />)
      expect(screen.queryByLabelText('Zero Waste')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('KM0')).not.toBeInTheDocument()
    })
  })

  it('does not render cultural badges when food has no metadata', () => {
    const plainFood = food({
      id: 'veg-brocoli', name: 'Brócoli', category: FoodCategory.VEGETABLES,
      gramsPerRation: 150, kcalPer100g: 34, proteinPer100g: 2.8,
      carbsPer100g: 7, fiberPer100g: 2.6, fatPer100g: 0.4,
      carbonFootprint: 0.3, isSeasonal: true,
    })
    const plainPlan: WeeklyPlan = {
      days: [{ day: 1, entries: [{ food: plainFood, rations: 1 }] }],
      dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
      weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
      valid: true,
    }
    renderPlan(<PlanView {...defaultProps} weeklyPlan={plainPlan} />)
    expect(screen.queryByLabelText('Cocina tradicional')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Comida en compañía')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('erMedDiet')).not.toBeInTheDocument()
  })

  describe('meal grouping', () => {
    const baseFood = (id: string, name: string, cat: FoodCategory) => food({
      id, name, category: cat,
      gramsPerRation: 100, kcalPer100g: 100, proteinPer100g: 5,
      carbsPer100g: 10, fiberPer100g: 1, fatPer100g: 2,
      carbonFootprint: 0.5, isSeasonal: true,
    })

    function groupedPlan(entries: WeeklyPlan['days'][0]['entries']): WeeklyPlan {
      return {
        days: [{ day: 1, entries }],
        dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
        weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
        valid: true,
      }
    }

    it('renders meals in BREAKFAST → LUNCH → DINNER → SNACK order', () => {
      const plan = groupedPlan([
        { food: baseFood('f1', 'Arroz', FoodCategory.CEREALS), rations: 1, mealType: MealType.DINNER },
        { food: baseFood('f2', 'Pan', FoodCategory.CEREALS), rations: 1, mealType: MealType.LUNCH },
        { food: baseFood('f3', 'Fruta', FoodCategory.FRUITS), rations: 1, mealType: MealType.BREAKFAST },
        { food: baseFood('f4', 'Yogur', FoodCategory.DAIRY), rations: 1, mealType: MealType.SNACK },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)

      const headers = screen.getAllByRole('heading', { level: 3 })
      expect(headers).toHaveLength(4)
      expect(headers[0]).toHaveTextContent(/desayuno/i)
      expect(headers[1]).toHaveTextContent(/almuerzo/i)
      expect(headers[2]).toHaveTextContent(/cena/i)
      expect(headers[3]).toHaveTextContent(/snack/i)
    })

    it('skips empty meal groups (e.g., no SNACK)', () => {
      const plan = groupedPlan([
        { food: baseFood('f1', 'Fruta', FoodCategory.FRUITS), rations: 1, mealType: MealType.BREAKFAST },
        { food: baseFood('f2', 'Arroz', FoodCategory.CEREALS), rations: 1, mealType: MealType.LUNCH },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)

      const headers = screen.getAllByRole('heading', { level: 3 })
      expect(headers).toHaveLength(2)
      expect(headers[0]).toHaveTextContent(/desayuno/i)
      expect(headers[1]).toHaveTextContent(/almuerzo/i)
    })

    it('preserves existing features (cultural badges, zero waste)', () => {
      const culturalFood = food({
        id: 'test-cultural', name: 'Garbanzos', category: FoodCategory.LEGUMES,
        gramsPerRation: 60, kcalPer100g: 340, proteinPer100g: 24,
        carbsPer100g: 54, fiberPer100g: 11, fatPer100g: 1.5,
        carbonFootprint: 0.8, isSeasonal: true,
        culturalMetadata: { traditionalCuisine: true, erMedDiet: true },
      })
      const plan = groupedPlan([
        { food: culturalFood, rations: 1, mealType: MealType.LUNCH },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
      // Cultural badge still renders
      expect(screen.getByLabelText('Cocina tradicional')).toBeInTheDocument()
      expect(screen.getByLabelText('erMedDiet')).toBeInTheDocument()
    })
  })

  describe('kcal display', () => {
    const kcalFood = (id: string, name: string, cat: FoodCategory, kcal: number, grams: number) => food({
      id, name, category: cat,
      gramsPerRation: grams, kcalPer100g: kcal, proteinPer100g: 5,
      carbsPer100g: 10, fiberPer100g: 1, fatPer100g: 2,
      carbonFootprint: 0.5, isSeasonal: true,
    })

    function kcalPlan(entries: WeeklyPlan['days'][0]['entries']): WeeklyPlan {
      return {
        days: [{ day: 1, entries }],
        dailyResults: [{ valid: true, violations: [], animalProteinCount: 0 }],
        weeklyResult: { valid: true, violations: [], animalProteinCount: 0 },
        valid: true,
      }
    }

    it('displays kcal and % for each meal group', () => {
      // 2× foodA (100kcal/100g, 50g) each → (100*50/100)*2 = 100 kcal
      // 1× foodB (200kcal/100g, 100g) → (200*100/100)*1 = 200 kcal
      // Total LUNCH: 300 kcal, % = 300/2000*100 = 15%
      useTrackerStore.setState({
        caloricTarget: { target: 2000, bmr: 1500, tdee: 2000, deficit: 0, restrictionActive: false },
      })
      const plan = kcalPlan([
        { food: kcalFood('a', 'FoodA', FoodCategory.CEREALS, 100, 50), rations: 2, mealType: MealType.LUNCH },
        { food: kcalFood('b', 'FoodB', FoodCategory.VEGETABLES, 200, 100), rations: 1, mealType: MealType.LUNCH },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
      const header = screen.getByRole('heading', { level: 3, name: /almuerzo/i })
      expect(header).toHaveTextContent(/3\d{2}.*kcal/i)
      expect(header).toHaveTextContent(/1[5-9]%/i) // 15%
    })

    it('shows — when caloricTarget is null', () => {
      useTrackerStore.setState({ caloricTarget: null })
      const plan = kcalPlan([
        { food: kcalFood('a', 'FoodA', FoodCategory.CEREALS, 100, 50), rations: 1, mealType: MealType.BREAKFAST },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
      const header = screen.getByRole('heading', { level: 3, name: /desayuno/i })
      expect(header).toHaveTextContent(/—/)
    })

    it('shows — when caloricTarget.target is zero', () => {
      useTrackerStore.setState({
        caloricTarget: { target: 0, bmr: 0, tdee: 0, deficit: 0, restrictionActive: false },
      })
      const plan = kcalPlan([
        { food: kcalFood('a', 'FoodA', FoodCategory.CEREALS, 100, 50), rations: 1, mealType: MealType.BREAKFAST },
      ])
      renderPlan(<PlanView {...defaultProps} weeklyPlan={plan} />)
      const header = screen.getByRole('heading', { level: 3, name: /desayuno/i })
      expect(header).toHaveTextContent(/—/)
    })
  })
})
