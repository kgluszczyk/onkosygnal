import { test, expect } from '@playwright/test';

test('home shows the persistent educational banderola (disclaimer)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/narzędzie edukacyjne/i).first()).toBeVisible();
});

test('a red-flag symptom surfaces guidance + the DiLO fast-track + doctor hand-off', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/opisz, co czujesz/i).fill('mam krew w stolcu od trzech tygodni');
  await page.getByRole('button', { name: /sprawdź sygnały/i }).click();

  await expect(page.getByRole('heading', { name: /rozpoznane sygnały/i })).toBeVisible();
  await expect(page.getByText(/krew w stolcu/i).first()).toBeVisible();
  await expect(page.getByText(/karta DiLO/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /drukuj/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /podsumowanie do rozmowy z lekarzem/i })).toBeVisible();
});

test('an emergency symptom shows the 112/SOR rupture', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/opisz, co czujesz/i).fill('masywne krwawienie, dużo krwi');
  await page.getByRole('button', { name: /sprawdź sygnały/i }).click();
  await expect(page.getByRole('alert').first()).toContainText(/112/);
});

test('the recognized symptom word gets the ochre caring-reader underline', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/opisz, co czujesz/i).fill('chrypka od miesiąca');
  // the mirror layer wraps recognized words in <mark class="mark">
  await expect(page.locator('mark.mark', { hasText: /chrypka/i }).first()).toBeVisible();
});

test('screening programmes are presented (NFZ section)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/mammografia/i).first()).toBeVisible();
  await expect(page.getByText(/cytologia/i).first()).toBeVisible();
});

test('theme toggle flips the color scheme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /tryb (ciemny|jasny)/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('the "o projekcie" page explains why there is no probability', async ({ page }) => {
  await page.goto('/o-projekcie');
  await expect(page.getByText(/nie podajemy .procentu ryzyka/i)).toBeVisible();
});
