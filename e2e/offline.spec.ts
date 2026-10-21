import { test, expect, type Page } from '@playwright/test';

/**
 * Real offline cold start.
 *
 * `vite-plugin-pwa` emits the service worker only in a production build, so
 * the dev-server suite can never prove this path: it cuts the network AFTER the
 * app is loaded, which leaves the reload untested. Here the app boots from the
 * build+preview server, waits for the worker to control the page, then reloads
 * with the network down.
 */

async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null;
    },
    undefined,
    { timeout: 30_000 },
  );

  // `clientsClaim` should control the first page; reload once if it did not.
  if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null))) {
    await page.reload();
  }

  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 30_000,
  });
}

test.describe('NutreFitDia offline cold start', () => {
  test('reloads with no network and completes the demo tour', async ({ page, context }) => {
    await page.goto('/');
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /demo guiada/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /datos iniciales/i })).toBeVisible();

    for (const heading of [
      /perfil/i,
      /escaneo/i,
      /recomendación/i,
      /sustitución/i,
      /validaciones/i,
    ]) {
      await dialog.getByRole('button', { name: /siguiente/i }).click();
      await expect(dialog.getByRole('heading', { name: heading })).toBeVisible();
    }

    await dialog.getByRole('button', { name: /siguiente/i }).click();
    await expect(dialog.getByText('Correcto')).toHaveCount(6);
    await expect(dialog.getByText('Falló')).toHaveCount(0);
  });
});
