import { test, expect, type Page } from '@playwright/test';

async function waitForSPA(page: Page) {
    await page.waitForFunction(() => {
        return document.querySelector('#docs-view.is-active') !== null
            || document.querySelector('#docs-landing') !== null
            || (document.querySelector('#page-view.is-active') !== null
                && document.querySelector('#page-view .vd-dynamic-loader') === null);
    }, { timeout: 10000 });
}

test.describe('Primitives docs section @e2e', () => {
    test('overview route loads and explains the layer model', async ({ page }) => {
        await page.goto('/#docs/primitives-overview');
        await waitForSPA(page);
        await expect(page.locator('#primitives-overview')).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/#docs\/primitives-overview/);
        await expect(page.locator('#primitives-overview')).toContainText('primitives');
    });

    test('reference route renders primitive demos with applied styles', async ({ page }) => {
        await page.goto('/#docs/primitives');
        await waitForSPA(page);
        await expect(page.locator('#primitives')).toBeVisible({ timeout: 10000 });

        // A .vd-stack[data-gap="fib-8"] resolves to a real flex column gap (12px),
        // proving the framework primitives CSS is loaded and applied in docs.
        const styles = await page.locator('#primitives .vd-stack[data-gap="fib-8"]').first().evaluate((el) => {
            const cs = getComputedStyle(el);
            return { display: cs.display, dir: cs.flexDirection, gap: cs.rowGap };
        });
        expect(styles.display).toBe('flex');
        expect(styles.dir).toBe('column');
        expect(styles.gap).toBe('12px');

        // A .vd-box[data-bg="secondary"] resolves to a non-transparent surface,
        // proving the box primitive's attribute API is wired in the docs bundle.
        const bg = await page.locator('#primitives .vd-box[data-bg="secondary"]').first()
            .evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('sidebar exposes the Primitives category sections', async ({ page }) => {
        await page.goto('/#docs/components');
        await waitForSPA(page);
        await expect(page.locator('.doc-nav-link[data-section="primitives-overview"]')).toHaveCount(1);
        await expect(page.locator('.doc-nav-link[data-section="primitives"]')).toHaveCount(1);
    });
});
