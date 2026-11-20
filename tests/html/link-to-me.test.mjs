// Built-HTML tests for the homepage link-to-me box: this site's own button
// beside a ready-made embed snippet in the blog's code-block style, with a
// Copy control. Assert rendered HTML a visitor receives — visible text and
// document order of visible content — never CSS property values, markup
// minutiae, or script internals. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { HEADING, images, codeBlocks, visibleText, decodeEntities } from './helpers.mjs';

const SITE = 'https://ht4w5.github.io';
const BUTTON_PATH = '/buttons/ht4w5.png';
// The opening of the embed snippet, as the visitor reads it in the code
// block: distinct from the rendered page around it.
const SNIPPET_PREFIX = `<a href="${SITE}/"><img src="${SITE}${BUTTON_PATH}"`;

/** The rendered label and document position of every button on the page. */
function buttonLabels(html) {
  return [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => ({
    text: decodeEntities(m[1]).trim(),
    index: m.index,
  }));
}

test('the link-to-me box leads the buttons section, showing this site\'s own button', async () => {
  const html = await loadBuiltPage('index.html');

  const heading = html.match(HEADING);
  assert.ok(heading, 'homepage shows a heading with the text "buttons"');

  // The box shows this site's own button art — 88×31 with descriptive alt
  // text — first thing under the section heading.
  const art = images(html).filter(
    (img) => img.src === BUTTON_PATH || img.src === `${SITE}${BUTTON_PATH}`
  );
  assert.ok(art.length > 0, "the page renders the site's own button art");
  const boxArt = art[0];
  assert.ok(boxArt.index > heading.index, 'the button art sits under the buttons heading');
  assert.equal(boxArt.width, '88', `the button is 88 wide: ${boxArt.tag}`);
  assert.equal(boxArt.height, '31', `the button is 31 tall: ${boxArt.tag}`);
  const alt = boxArt.alt;
  assert.ok(alt && alt.trim().length > 0, 'the button has descriptive alt text');

  // The snippet is shown in a code block — and shown to the visitor exactly
  // once: the box is neither missing nor duplicated.
  const snippet = codeBlocks(html).find((block) => block.text.includes(SNIPPET_PREFIX));
  assert.ok(snippet, 'the code block contains the snippet');
  const shownCount = visibleText(html).split(SNIPPET_PREFIX).length - 1;
  assert.equal(shownCount, 1, 'the embed snippet is shown exactly once');

  const copy = buttonLabels(html).find((button) => /copy/i.test(button.text));
  assert.ok(copy, 'the box offers a Copy control');

  // Document order of visible content: the box leads the wall — its button
  // art, then the snippet/copy text, before the first wall button's alt text.
  assert.ok(boxArt.index < snippet.index, 'the button art appears before the snippet');
  const firstWallImage = images(html).find((img) => img.index > copy.index);
  assert.ok(firstWallImage, 'the wall renders buttons after the link-to-me box');
  assert.ok(
    snippet.index < firstWallImage.index,
    "the snippet appears before the first wall button's alt text"
  );
  assert.ok(
    copy.index < firstWallImage.index,
    "the Copy text appears before the first wall button's alt text"
  );
  assert.ok(
    firstWallImage.alt && firstWallImage.alt.trim().length > 0,
    'the first wall button has descriptive alt text'
  );

  // The box and the wall's self entry show the same button, so their alt
  // text must match.
  const wallArt = art.find((img) => img.index > snippet.index);
  assert.ok(wallArt, 'the wall renders the self button');
  assert.equal(alt, wallArt.alt, "the box's alt text matches the self button's");
});

test('the snippet is the anchor-wrapping-image HTML with absolute URLs in a code block', async () => {
  const html = await loadBuiltPage('index.html');
  const snippet = codeBlocks(html).find((block) => block.text.includes(SNIPPET_PREFIX));
  assert.ok(snippet, 'the snippet is rendered in a code block');

  const text = snippet.text;
  assert.ok(
    text.includes(`<a href="${SITE}/">`),
    `the snippet links to the site root with an absolute URL: ${text}`
  );
  assert.ok(
    text.includes(`${SITE}${BUTTON_PATH}`),
    `the snippet embeds the button art with an absolute URL: ${text}`
  );
  assert.ok(
    /<a[\s\S]*<img[\s\S]*<\/a>/.test(text),
    `the snippet is the anchor-wrapping-image form: ${text}`
  );
  assert.match(text, /width="88"/, `the embedded image is 88 wide: ${text}`);
  assert.match(text, /height="31"/, `the embedded image is 31 tall: ${text}`);
});

test('the link-to-me box offers a Copy control', async () => {
  const html = await loadBuiltPage('index.html');
  const snippet = codeBlocks(html).find((block) => block.text.includes(SNIPPET_PREFIX));
  assert.ok(snippet, 'the homepage has a link-to-me box');

  const copy = buttonLabels(html).find((button) => /copy/i.test(button.text));
  assert.ok(copy, 'the box offers a Copy control labelled for copying');
});
