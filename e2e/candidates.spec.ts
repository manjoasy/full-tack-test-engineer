import { test, expect } from '@playwright/test';

test.describe('Candidate Management Flow', () => {
  test('should allow a user to login, create, validate and delete a candidate', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Candidats');

    // 2. Create Candidate
    await page.click('text=Nouveau candidat');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '0123456789');
    await page.fill('input[name="position"]', 'QA Engineer');
    await page.fill('input[name="experience"]', '3');
    await page.fill('input[name="skills.0"]', 'Playwright');
    
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=John Doe')).toBeVisible();

    // 3. View Detail & Validate
    await page.click('a[href^="/candidates/"]:has(.lucide-eye)'); // Click eye icon
    await expect(page.locator('h1')).toContainText('Détails du candidat');
    await expect(page.locator('.badge-draft')).toBeVisible();

    await page.click('text=Valider le profil');
    // Wait for the 2s simulated delay
    await expect(page.locator('.badge-validated')).toBeVisible({ timeout: 10000 });

    // 4. Delete
    await page.click('text=Supprimer');
    // Handle dialog
    page.on('dialog', dialog => dialog.accept());
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=John Doe')).not.toBeVisible();
  });
});
