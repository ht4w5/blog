// Shared helpers for the browser test seam. Everything here works with what a
// visitor observes — rendered geometry (bounding boxes), visibility, and
// on-screen arrangement — never CSS property values, markup minutiae, or
// script internals. Run via `pnpm test`.
import type { Locator, Page } from '@playwright/test';

/** The spec-pinned desktop viewport. */
export const DESKTOP = { width: 1280, height: 800 };

/** The spec-pinned phone viewport. */
export const PHONE = { width: 375, height: 812 };

/** The post-entry links of a rendered post list, in list order. */
export const postLinks = (page: Page) => page.getByRole('heading', { level: 2 }).getByRole('link');

/** The on-screen rectangle a visitor sees for an element. */
export type Box = { x: number; y: number; width: number; height: number };

/** Pixel slack for geometry assertions: sub-pixel rounding and font metrics. */
export const LAYOUT_SLACK = 2;

/** A locator's current on-screen rectangle. */
export const box = (locator: Locator): Promise<Box> => locator.boundingBox() as Promise<Box>;

/** The current on-screen rectangles of several locators, in order. */
export const boxes = (locators: Locator[]): Promise<Box[]> => Promise.all(locators.map(box));

/** Whether two rectangles share a vertical band (they sit on the same row). */
export const overlapsVertically = (a: Box, b: Box): boolean =>
  a.y < b.y + b.height && b.y < a.y + a.height;

/** Whether `a` sits below `b` (within LAYOUT_SLACK). */
export const isBelow = (a: Box, b: Box): boolean => a.y >= b.y + b.height - LAYOUT_SLACK;

/** Whether `a` is fully inside `b`'s rectangle (within LAYOUT_SLACK). */
export const isWithin = (a: Box, b: Box): boolean =>
  a.x >= b.x - LAYOUT_SLACK &&
  a.y >= b.y - LAYOUT_SLACK &&
  a.x + a.width <= b.x + b.width + LAYOUT_SLACK &&
  a.y + a.height <= b.y + b.height + LAYOUT_SLACK;
