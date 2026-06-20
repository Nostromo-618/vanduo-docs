import { test, expect, type Page } from '@playwright/test';

async function waitForSPA(page: Page) {
    await page.waitForFunction(() => {
        return document.querySelector('#page-view.is-active') !== null && document.querySelector('#page-view .vd-dynamic-loader') === null
            || document.querySelector('#docs-view.is-active') !== null
            || document.querySelector('#docs-landing') !== null;
    }, { timeout: 10000 });
}

async function goToExpandingCards(page: Page) {
    await page.goto('/#docs/expanding-cards');
    await waitForSPA(page);
    await page.waitForSelector('#expanding-cards', { state: 'attached', timeout: 25000 });
    await page.waitForTimeout(400);
}

test.describe('Expanding Cards – Docs Section', () => {
    test.slow();

    test('section loads and photo strip is visible', async ({ page }) => {
        await goToExpandingCards(page);
        await expect(page.locator('#expanding-cards .demo-title')).toContainText('Expanding Cards');
        const strip = page.locator('#expanding-cards .vd-expanding-cards').first();
        await expect(strip).toBeVisible();
        await expect(strip.locator('.vd-expanding-card.is-active')).toHaveCount(1);
    });

    test('photo strip uses local expanding images, not external Tumblr URLs', async ({ page }) => {
        await goToExpandingCards(page);
        const strip = page.locator('#expanding-cards .vd-expanding-cards').first();
        const cards = strip.locator('.vd-expanding-card');
        await expect(cards).toHaveCount(5);

        for (let i = 0; i < 5; i++) {
            const style = await cards.nth(i).getAttribute('style');
            expect(style).toContain('images/expanding/');
            expect(style).not.toContain('tumblr.com');
        }
    });

    test('clicking second panel moves active state', async ({ page }) => {
        /* Desktop horizontal layout needs enough width for side-by-side stripes */
        await page.setViewportSize({ width: 1024, height: 800 });
        await goToExpandingCards(page);
        const strip = page.locator('#expanding-cards .vd-expanding-cards').first();
        const second = strip.locator('.vd-expanding-card').nth(1);
        await expect(second).toBeVisible();
        await second.click();
        await expect(second).toHaveClass(/is-active/);
    });

    test('mobile viewport shows all cards and expands active card in place', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await goToExpandingCards(page);
        const strip = page.locator('#expanding-cards .expanding-cards-photos .vd-expanding-cards');
        const cards = strip.locator('.vd-expanding-card');
        await expect(cards).toHaveCount(5);

        for (let i = 0; i < 5; i++) {
            await expect(cards.nth(i)).toBeVisible();
        }

        const first = cards.nth(0);
        const third = cards.nth(2);
        await third.scrollIntoViewIfNeeded();
        await third.click();
        await expect(third).toHaveClass(/is-active/);

        await expect.poll(async () => {
            return strip.evaluate((container) => {
                const active = container.querySelector('.vd-expanding-card.is-active');
                if (!active) return false;
                return active.getBoundingClientRect().height > 120;
            });
        }).toBe(true);

        await expect.poll(async () => {
            return first.evaluate((el) => el.getBoundingClientRect().height < 80);
        }).toBe(true);
    });
});

test.describe('Cards – Docs Section', () => {
    test.slow();

    test('cards section exposes glow, glass, and morph demos', async ({ page }) => {
        await page.goto('/#docs/cards');
        await waitForSPA(page);
        await page.waitForSelector('#cards', { state: 'attached', timeout: 25000 });
        await page.waitForTimeout(400);

        await expect(page.locator('#demo-card-glow-hover')).toBeVisible();
        await expect(page.locator('#demo-card-glass')).toBeVisible();
        await expect(page.locator('#demo-card-morph-block')).toBeVisible();
    });
});
