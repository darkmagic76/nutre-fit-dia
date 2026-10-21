import { test, expect } from '@playwright/test';

/**
 * Demo reproducible flow (demo-guide): clean-profile offline 6-step
 * evaluator path. Per-step asserts mirror the domain truth recomputed by
 * `computeDemoChecks` — never hardcoded strings alone — so clinical drift
 * (threshold/food change) turns a check FAIL and this spec goes red by
 * design (drift-fails-loudly).
 */
test.describe('NutreFitDia Demo Reproducible Flow', () => {
  test('visible entry button opens the tour at step 1', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /demo guiada/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();
  });

  test('complete 6-step offline tour with domain-truth checks', async ({ page }) => {
    await page.goto('/');
    // Offline AFTER initial load: the PWA tour must run without network.
    await page.context().setOffline(true);

    await page.getByRole('button', { name: /demo guiada/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Step 1 datos: seeded flag shown (expected vs actual).
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();
    await expect(dialog.getByText(/seeded/i).first()).toBeVisible();
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Step 2 perfil: glucose=100 walk shows BMR/TDEE (own-data walk).
    await expect(dialog.getByRole('heading', { name: /perfil/i })).toBeVisible();
    await expect(dialog.getByText(/BMR/i)).toBeVisible();
    await expect(dialog.getByText(/TDEE/i)).toBeVisible();
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Step 3 escaneo: oil-aove GREEN / cola RED (sole worked hint).
    await expect(dialog.getByRole('heading', { name: /escaneo/i })).toBeVisible();
    await expect(dialog.getByText(/green/i).first()).toBeVisible();
    await expect(dialog.getByText(/red/i).first()).toBeVisible();
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Step 4 recomendacion: valid 7-day plan, Day 1 rendered.
    await expect(dialog.getByRole('heading', { name: /recomendación/i })).toBeVisible();
    await expect(dialog.getByText(/valid · 7 days/i)).toBeVisible();
    await expect(page.locator('#panel-plan')).toContainText(/Día 1/);
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Step 5 sustitucion: 1–3 sustainable alternatives.
    await expect(dialog.getByRole('heading', { name: /sustitución/i })).toBeVisible();
    await expect(dialog.getByText(/1-3 alternatives/i)).toBeVisible();
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Step 6 validaciones: daily + weekly violations listed in the tour and in the Log tab.
    await expect(dialog.getByRole('heading', { name: /validaciones/i })).toBeVisible();
    await expect(dialog.getByText(/violations/i).first()).toBeVisible();
    await expect(page.locator('#panel-log')).toContainText(/Errores detectados|violaciones/i);
    await expect(dialog.getByText('Falló')).toHaveCount(0);
    await dialog.getByRole('button', { name: /siguiente/i }).click();

    // Completed summary: all 6 steps pass — drift fails loudly here.
    await expect(dialog.getByText('Correcto')).toHaveCount(6);
    await expect(dialog.getByText('Falló')).toHaveCount(0);
  });

  test('tour follows the app locale (EN)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to english/i }).click();

    await page.getByRole('button', { name: /guided demo/i }).click();
    const dialog = page.getByRole('dialog');

    await expect(dialog.getByRole('heading', { name: /initial data/i })).toBeVisible();
    await expect(dialog.getByText(/expected:/i).first()).toBeVisible();
  });

  test('replay resets the tour from scratch', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /demo guiada/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();

    // Advance into the walk, then replay.
    await dialog.getByRole('button', { name: /siguiente/i }).click();
    await expect(dialog.getByRole('heading', { name: /perfil/i })).toBeVisible();

    await dialog.getByRole('button', { name: /reiniciar demo/i }).click();

    // Back at step 1 with a fresh seed.
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();
    await expect(dialog.getByText(/seeded/i).first()).toBeVisible();
  });

  test('exit preserves seeded data (reopen asks to confirm)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /demo guiada/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();

    // Exit mid-tour: overlay closes, no wipe occurs.
    await dialog.getByRole('button', { name: /salir de la demo/i }).click();
    await expect(dialog).toBeHidden();

    // Reopen: seeded data remains, so the guard asks to confirm.
    await page.getByRole('button', { name: /demo guiada/i }).click();
    await expect(dialog.getByText(/ya hay datos guardados/i)).toBeVisible();
  });

  test('deep-link ?demo=1 opens the tour and strips the param', async ({ page }) => {
    await page.goto('/?demo=1');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();
    await expect(page).not.toHaveURL(/demo=1/);
  });
});
