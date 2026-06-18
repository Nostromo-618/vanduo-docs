import { test, expect, type Page } from '@playwright/test';

async function waitForSPA(page: Page) {
    await page.waitForFunction(() => {
        return document.querySelector('#docs-view.is-active') !== null
            || document.querySelector('#docs-landing') !== null;
    }, { timeout: 10000 });
}

test.describe('Core docs — Typography & Golden Ratio @e2e', () => {
    test('Typography shows the golden-ratio type scale and φ leading', async ({ page }) => {
        await page.goto('/#docs/typography');
        await waitForSPA(page);
        const section = page.locator('#typography');
        await expect(section).toBeVisible({ timeout: 10000 });

        await expect(section).toContainText('golden-ratio type scale');
        await expect(section).toContainText('√φ');
        await expect(section.locator('code', { hasText: '--vd-font-size-6xl' })).toHaveCount(1);
        // The φ line-height token is actually applied in the leading visualizer.
        const lh = await section.locator('p[style*="line-height: var(--vd-line-height-relaxed)"]').first()
            .evaluate((el) => getComputedStyle(el).lineHeight);
        expect(parseFloat(lh)).toBeGreaterThan(20); // 1.618 × ~16px ≈ 26px (not "normal")
    });

    test('Golden Ratio explainer + interactive Fibonacci slider', async ({ page }) => {
        await page.goto('/#docs/golden-ratio');
        await waitForSPA(page);
        const section = page.locator('#golden-ratio');
        await expect(section).toBeVisible({ timeout: 10000 });

        // The honest φ-vs-conventional explainer is present.
        await expect(section).toContainText("Where the golden ratio lives");
        await expect(section).toContainText('conventional');

        // The interactive spacing slider reports the golden ratio at fib-55/fib-34.
        const slider = section.locator('[data-fib-slider-input]');
        await expect(slider).toHaveCount(1);
        await slider.evaluate((el: HTMLInputElement) => {
            el.value = '8';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await expect(section.locator('[data-fib-slider-value]')).toHaveText('55px');
        await expect(section.locator('[data-fib-slider-ratio]')).toContainText('1.618');
    });
});
