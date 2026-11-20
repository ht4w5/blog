// Built-HTML tests for the homepage link-to-me box: this site's own button
// beside a ready-made embed snippet in the blog's code-block style, with a
// Copy control. Assert rendered HTML a visitor receives — never CSS property
// values, markup minutiae, or script internals. Run via `pnpm test`, which
// builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';

const SITE = 'https://ht4w5.github.io';
const BUTTON_PATH = '/buttons/ht4w5.png';
const HEADING = /<h[1-6][^>]*>buttons<\/h[1-6]>/;

function attr(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? null;
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** The link-to-me box region: from its wrapper up to the wall grid. */
function boxRegion(html) {
  const start = html.indexOf('class="link-to-me"');
  const wall = html.indexOf('class="button-wall"');
  if (start === -1 || wall === -1 || start > wall) return null;
  return html.slice(start, wall);
}

/** The snippet's code-block text, decoded from its HTML-escaped form. */
function snippetText(region) {
  const code = region.match(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/);
  return code ? decodeEntities(code[1]) : null;
}

test('the link-to-me box leads the buttons section, showing this site\'s own button', async () => {
  const html = await loadBuiltPage('index.html');

  const heading = html.match(HEADING);
  assert.ok(heading, 'homepage shows a heading with the text "buttons"');

  const region = boxRegion(html);
  assert.ok(region, 'the buttons section starts with a link-to-me box before the wall grid');

  const start = html.indexOf('class="link-to-me"');
  assert.ok(
    start > heading.index,
    'the link-to-me box sits at the top of the buttons section'
  );

  const images = region.match(/<img\s[^>]*>/g) ?? [];
  assert.equal(images.length, 1, 'the box shows exactly one image: this site\'s own button');

  const img = images[0];
  const src = attr(img, 'src');
  assert.ok(
    src === BUTTON_PATH || src === `${SITE}${BUTTON_PATH}`,
    `the box shows the site's own button art: ${img}`
  );
  assert.equal(attr(img, 'width'), '88', `the button is 88 wide: ${img}`);
  assert.equal(attr(img, 'height'), '31', `the button is 31 tall: ${img}`);
  const alt = attr(img, 'alt');
  assert.ok(alt && alt.trim().length > 0, `the button has descriptive alt text: ${img}`);

  // The box and the wall's self entry show the same button, so their alt
  // text must match.
  const wall = html.slice(html.indexOf('class="button-wall"'));
  const wallImg = (wall.match(/<img\s[^>]*>/g) ?? []).find(
    (tag) => (attr(tag, 'src') ?? '').endsWith(BUTTON_PATH)
  );
  assert.ok(wallImg, 'the wall renders the self button');
  assert.equal(alt, attr(wallImg, 'alt'), 'the box\'s alt text matches the self button\'s');
});

test('the snippet is the anchor-wrapping-image HTML with absolute URLs in a code block', async () => {
  const html = await loadBuiltPage('index.html');
  const region = boxRegion(html);
  assert.ok(region, 'the homepage has a link-to-me box');

  assert.ok(/<pre[\s>]/.test(region), 'the snippet is rendered in a code block');

  const snippet = snippetText(region);
  assert.ok(snippet, 'the code block contains the snippet');

  assert.ok(
    snippet.includes(`<a href="${SITE}/">`),
    `the snippet links to the site root with an absolute URL: ${snippet}`
  );
  assert.ok(
    snippet.includes(`${SITE}${BUTTON_PATH}`),
    `the snippet embeds the button art with an absolute URL: ${snippet}`
  );
  assert.ok(
    /<a[\s\S]*<img[\s\S]*<\/a>/.test(snippet),
    `the snippet is the anchor-wrapping-image form: ${snippet}`
  );
  assert.match(snippet, /width="88"/, `the embedded image is 88 wide: ${snippet}`);
  assert.match(snippet, /height="31"/, `the embedded image is 31 tall: ${snippet}`);
});

test('the link-to-me box offers a Copy control', async () => {
  const html = await loadBuiltPage('index.html');
  const region = boxRegion(html);
  assert.ok(region, 'the homepage has a link-to-me box');

  const buttons = [...region.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)];
  assert.ok(buttons.length > 0, 'the box offers a Copy control');

  const label = decodeEntities(buttons.map((m) => m[1]).join(' '));
  assert.match(label, /copy/i, 'the Copy control is labelled for copying');
});
