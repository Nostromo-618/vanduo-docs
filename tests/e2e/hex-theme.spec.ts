import { test, expect, type Page } from '@playwright/test';

async function waitForSPA(page: Page) {
    await page.waitForFunction(() => {
        return document.querySelector('#docs-view.is-active') !== null
            || document.querySelector('#docs-landing') !== null;
    }, { timeout: 10000 });
}

// Average RGB of the hex canvas — the grid fills it with the theme's bg color, so
// this changes markedly when the canvas re-themes.
async function canvasAverage(page: Page) {
    return await page.locator('#hex-demo').evaluate((c: HTMLCanvasElement) => {
        const ctx = c.getContext('2d')!;
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 400) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    });
}

test.describe('Hex grid canvas theming @e2e', () => {
    test('canvas re-renders to match the active theme (no reload)', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/#docs/vd-hex');
        await waitForSPA(page);
        await expect(page.locator('#hex-demo')).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1200); // canvas first render

        const light = await canvasAverage(page);

        // Switch to dark the same way the docs theme switcher does.
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await page.waitForTimeout(500);
        const dark = await canvasAverage(page);

        const distance = Math.hypot(light[0] - dark[0], light[1] - dark[1], light[2] - dark[2]);
        // A re-themed canvas shifts substantially; a stuck (light-fallback) canvas would not.
        expect(distance).toBeGreaterThan(40);
        // And dark really is darker.
        expect(dark[0] + dark[1] + dark[2]).toBeLessThan(light[0] + light[1] + light[2]);
    });

    test('re-entering the hex section does not throw (destroy guard)', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));

        await page.goto('/#docs/vd-hex');
        await waitForSPA(page);
        await expect(page.locator('#hex-demo')).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(800);

        // Navigate away and back — this tears down + re-inits the grid, which used to
        // throw "destroy is not a function" on the published 1.0.0 (no destroy()).
        await page.evaluate(() => { window.location.hash = '#docs/buttons'; });
        await page.waitForTimeout(1000);
        await page.evaluate(() => { window.location.hash = '#docs/vd-hex'; });
        await page.waitForTimeout(1200);

        await expect(page.locator('#hex-demo')).toBeVisible({ timeout: 10000 });
        expect(errors.filter((e) => /destroy is not a function/.test(e))).toHaveLength(0);
    });
});
