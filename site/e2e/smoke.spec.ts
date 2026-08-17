import { test, expect } from '@playwright/test';

test('home shows the load-bearing disclaimer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/narzędzie edukacyjne, nie diagnoza/i)).toBeVisible();
});

test('a red-flag symptom surfaces guidance + the DiLO fast-track panel', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/opisz swoje objawy/i).fill('mam krew w stolcu od trzech tygodni');
  await page.getByRole('button', { name: /sprawdź/i }).click();

  await expect(page.getByRole('heading', { name: /objawy warte konsultacji/i })).toBeVisible();
  await expect(page.getByText(/krew w stolcu/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /karta DiLO/i })).toBeVisible();
  // The doctor hand-off must be offered (print button + summary heading).
  await expect(page.getByRole('button', { name: /drukuj/i })).toBeVisible();
  await expect(page.getByText(/podsumowanie dla lekarza POZ/i)).toBeVisible();
});

test('an emergency symptom shows the 112/SOR banner', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/opisz swoje objawy/i).fill('masywne krwawienie, dużo krwi');
  await page.getByRole('button', { name: /sprawdź/i }).click();
  await expect(page.getByRole('alert')).toContainText(/112/);
});

test('screening programmes appear for an eligible woman', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/płeć/i).selectOption('female');
  await page.getByLabel(/wiek/i).fill('50');
  // screening panel renders without needing a symptom search
  await expect(page.getByText(/mammografia/i).first()).toBeVisible();
});

test('the "o projekcie" page explains why there is no probability', async ({ page }) => {
  await page.goto('/o-projekcie');
  await expect(page.getByText(/nie podajemy .procentu ryzyka/i)).toBeVisible();
});
