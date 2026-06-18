import { test, expect, type Page } from '@playwright/test';

async function waitForSPA(page: Page) {
    await page.waitForFunction(() => {
        return document.querySelector('#docs-view.is-active') !== null
            || document.querySelector('#docs-landing') !== null;
    }, { timeout: 10000 });
}

// Geometry of the spotlight tooltip relative to its current target + the viewport.
async function tooltipPlacement(page: Page, targetSelector: string) {
    return await page.evaluate((sel) => {
        const tip = document.querySelector('.vd-spotlight-tooltip');
        const tgt = document.querySelector(sel);
        if (!tip || !tgt) return null;
        const t = tip.getBoundingClientRect();
        const g = tgt.getBoundingClientRect();
        return {
            inViewport: t.top >= 0 && t.left >= 0 && t.bottom <= window.innerHeight + 1 && t.right <= window.innerWidth + 1,
            // distance from the target (tooltip sits just below, or above if it would overflow)
            nearTarget: Math.min(Math.abs(t.top - g.bottom), Math.abs(t.bottom - g.top)) <= 24,
            buttons: tip.querySelectorAll('.vd-spotlight-btn').length,
        };
    }, targetSelector);
}

test.describe('Spotlight feature tour @e2e', () => {
    test('first-run start positions the tooltip in-viewport next to the target', async ({ page }) => {
        await page.goto('/#docs/spotlight');
        await waitForSPA(page);
        await expect(page.locator('#spotlight')).toBeVisible({ timeout: 10000 });

        // Start the tour on the freshly-loaded section (the case that used to fail —
        // the tooltip was positioned once, mid smooth-scroll, and landed off-screen).
        await page.locator('#spotlight-start-btn').click();
        await expect(page.locator('.vd-spotlight-tooltip')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(700); // smooth scrollIntoView + settle

        const first = await tooltipPlacement(page, '#spot-target-search');
        expect(first).not.toBeNull();
        expect(first!.inViewport).toBe(true);
        expect(first!.nearTarget).toBe(true);
        expect(first!.buttons).toBeGreaterThanOrEqual(2);

        // Advancing keeps the tooltip glued to the next target, in viewport.
        await page.locator('.vd-spotlight-tooltip .vd-spotlight-btn-primary').click();
        await page.waitForTimeout(700);
        const second = await tooltipPlacement(page, '#spot-target-notifications');
        expect(second).not.toBeNull();
        expect(second!.inViewport).toBe(true);
        expect(second!.nearTarget).toBe(true);
    });
});
