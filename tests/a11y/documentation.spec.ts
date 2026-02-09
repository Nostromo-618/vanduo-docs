import { test, expect } from '@playwright/test';

test.describe('Documentation Page @a11y', () => {
  test('theme customizer includes all font options', async ({ page, viewport }) => {
    // Skip on mobile/tablet viewports where the fixed-position trigger
    // may be positioned off-screen
    test.skip(viewport !== null && viewport.width < 1024,
      'Theme customizer trigger not accessible on small viewports');

    await page.goto('/documentation.html');
    await page.waitForTimeout(500);

    // Scroll to top to ensure theme customizer trigger is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    // Open theme customizer
    const trigger = page.locator('[data-theme-customizer-trigger]');
    await trigger.click();
    await page.waitForTimeout(200);

    // Get font select element
    const fontSelect = page.locator('[data-customizer-font]');
    await expect(fontSelect).toBeVisible();

    // Check that Google Fonts are in the dropdown
    const options = await fontSelect.locator('option').allTextContents();
    expect(options).toContain('Ubuntu');
    expect(options).toContain('Open Sans');
    expect(options).toContain('Rubik');
    expect(options).toContain('Titillium Web');
  });
});
