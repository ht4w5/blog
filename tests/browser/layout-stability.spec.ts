// Layout stability (mobile-nav-toc user story 23: "the page loads without
// shifting under my fingers"). The browser's own layout-shift entries — its
// record of visible content moving after first paint — are what a reader
// experiences as the page settling under their fingers, so the test sums the
// buffered entries once loading has settled and asserts the total stays under
// a named bound. Assert what a visitor observes — never CSS property values,
// markup minutiae, or script internals.
import { test, expect, type Page } from '@playwright/test';
import { PHONE, DESKTOP } from './helpers';

// Cumulative layout shift a reader can absorb without taps landing wrong.
// Observed load noise (font swaps) sits under 0.02; a content jump — the bug
// this guards against — is far above.
const MAX_LAYOUT_SHIFT = 0.05;

// Representative pages at the viewports this spec reworked: the post with the
// table of contents and the homepage, on a phone and on a desktop window.
const PAGES = ['/blog/pooling-slices-in-go-without-extra-allocations', '/'];
const VIEWPORTS = [PHONE, DESKTOP];

// The cumulative layout-shift value since the page started loading: how much
// visible content has moved under the reader.
function loadShift(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            total += (entry as PerformanceEntry & { value: number }).value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 100);
      })
  );
}

test('the page loads without content shifting under the reader', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const path of PAGES) {
      await page.goto(path);
      // Let fonts and images settle; the buffered entries cover the whole
      // load either way.
      await page.waitForLoadState('networkidle');
      const shift = await loadShift(page);
      expect(shift, `${path} at ${viewport.width}×${viewport.height}`).toBeLessThanOrEqual(
        MAX_LAYOUT_SHIFT
      );
    }
  }
});
