// Shared helpers for the built-HTML test seam. Everything here works with
// what a visitor receives — rendered text, link destinations, link semantics,
// image alt text, and document order of that content — never CSS property
// values or markup structure minutiae. Run via `pnpm test`, which builds
// first.
import assert from 'node:assert/strict';

/** The footer copyright line. */
export const COPYRIGHT = /© \d{4} ht4w5/;

/** The value of an attribute in a rendered tag, or null. */
export function attr(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? null;
}

export function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * The text a visitor sees: markup, comments, and script/style contents
 * removed, entities decoded, whitespace collapsed and trimmed. Use it to
 * find or count visible text in document order.
 */
export function visibleText(html) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every anchor's attributes and inner content, each bounded by its own link. */
export function anchors(html) {
  return [...html.matchAll(/<a\s([^>]*)>((?:(?!<\/a>)[\s\S])*?)<\/a>/g)].map((m) => ({
    attrs: m[1],
    inner: m[2],
    index: m.index,
  }));
}

/** Every anchor's destination with its document position. */
export function links(html) {
  return anchors(html).map((a) => ({
    href: attr(a.attrs, 'href'),
    index: a.index,
  }));
}

/** Every element id on the page. */
export function ids(html) {
  return new Set([...html.matchAll(/id="([^"]*)"/g)].map((m) => m[1]));
}

/** Every image's alt text and dimensions with its document position. */
export function images(html) {
  return [...html.matchAll(/<img\s[^>]*>/g)].map((m) => ({
    tag: m[0],
    index: m.index,
    src: attr(m[0], 'src'),
    alt: attr(m[0], 'alt'),
    width: attr(m[0], 'width'),
    height: attr(m[0], 'height'),
  }));
}

/** Assert a destination opens safely in a new tab (external-link semantics). */
export function assertOpensSafelyInNewTab(anchorTag, label) {
  assert.equal(
    attr(anchorTag, 'target'),
    '_blank',
    `${label} opens in a new tab: ${anchorTag}`
  );
  const rel = (attr(anchorTag, 'rel') ?? '').split(/\s+/);
  assert.ok(rel.includes('noopener'), `${label} is noopener: ${anchorTag}`);
  assert.ok(rel.includes('noreferrer'), `${label} is noreferrer: ${anchorTag}`);
}
