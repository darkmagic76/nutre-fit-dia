import { test, expect } from '@playwright/test'

test.describe('NutreFitDia E2E Smoke', () => {
  test('complete flow: scan → classify → add to log → generate weekly plan', async ({ page }) => {
    await page.goto('/')

    // Verify app loads
    await expect(page.locator('h1')).toContainText('NutreFitDia')

    // Step 1: Select a food and classify
    const foodSelect = page.locator('#food-select')
    await foodSelect.selectOption('oil-aove')
    await expect(foodSelect).toHaveValue('oil-aove')

    // Click Classify
    await page.getByRole('button', { name: /clasificar/i }).click()

    // Verify classification result appears
    await expect(page.getByRole('status')).toBeVisible()

    // Step 2: Add to daily log — click the add button
    await page.getByRole('button', { name: /añadir/i }).click()

    // Step 3: Navigate to Plan tab
    await page.getByRole('tab', { name: /plan/i }).click()

    // Generate weekly plan
    await page.getByRole('button', { name: /generar plan/i }).click()

    // Verify plan appears with day structure
    await expect(page.getByText(/plan válido/i)).toBeVisible()
    await expect(page.getByText(/Día 1/i)).toBeVisible()
  })

  test('scanner classifies processed food as RED', async ({ page }) => {
    await page.goto('/')

    // Select a processed food with sugars
    const foodSelect = page.locator('#food-select')
    await foodSelect.selectOption('proc-refresco-cola')

    await page.getByRole('button', { name: /clasificar/i }).click()

    // Should show RED classification
    await expect(page.getByText(/evitar/i)).toBeVisible()
  })

  test('metabolic profile calculates caloric target', async ({ page }) => {
    await page.goto('/')

    // Navigate to metabolic profile
    await page.getByRole('tab', { name: /perfil/i }).click()

    // Click calculate
    await page.getByRole('button', { name: /calcular/i }).click()

    // Verify results appear
    await expect(page.getByText(/BMR/i)).toBeVisible()
    await expect(page.getByText(/TDEE/i)).toBeVisible()
  })

  test('switches to English and verifies translations', async ({ page }) => {
    await page.goto('/')

    // Click language toggle to switch to English
    await page.getByRole('button', { name: /switch to english/i }).click()

    // Verify English text appears
    await expect(page.locator('h1')).toContainText('NutreFitDia')
    await expect(page.getByText(/Comprehensive Self-Care/i)).toBeVisible()

    // Verify tab labels are in English
    await expect(page.getByRole('tab', { name: /traffic light/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /today/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /profile/i })).toBeVisible()

    // Switch back to Spanish
    await page.getByRole('button', { name: /cambiar a español/i }).click()
    await expect(page.getByRole('tab', { name: /semáforo/i })).toBeVisible()
  })
})
