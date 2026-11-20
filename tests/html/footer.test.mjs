// Built-HTML tests for the footer and the migrated buttons. The footer shows
// only the copyright line on every page, and the four buttons that used to
// live there now belong to the homepage button wall with their destinations
// preserved. Assert rendered HTML a visitor receives — never CSS property
// values, markup minutiae, or script internals. Run via `pnpm test`, which
// builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';

// Representative pages: the homepage, the site directory, a plain page, and a
// blog post. Every route renders the same footer.
const PAGES = [
  'index.html',
  'paths/index.html',
  'about/index.html',
  'blog/hello-world/index.html',
];

const COPYRIGHT = /© \d{4} ht4w5/;

// The four destinations of the buttons migrated from the old footer. Kept as
// literals (not read from src/data/buttons.ts) so a data regression cannot
// rewrite the expectation.
const MIGRATED_DESTINATIONS = [
  '/', // this site
  'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'https://xjtu.app/',
  'https://github.com/ht4w5',
];

/** The footer region of a built page, from <footer> to </footer>. */
function footerRegion(html) {
  const start = html.indexOf('<footer');
  assert.ok(start !== -1, 'page has a footer');
  const end = html.indexOf('</footer>', start);
  assert.ok(end !== -1, 'footer closes');
  return html.slice(start, end + '</footer>'.length);
}

/** The button wall region: from the `buttons` heading to the end of its section. */
function wallRegion(html) {
  const heading = html.match(/<h[1-6][^>]*>buttons<\/h[1-6]>/);
  assert.ok(heading, 'homepage shows a heading with the text "buttons"');
  const end = html.indexOf('</section>', heading.index);
  return end === -1
    ? html.slice(heading.index)
    : html.slice(heading.index, end + '</section>'.length);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const page of PAGES) {
  test(`footer on ${page} shows the copyright line`, async () => {
    const html = await loadBuiltPage(page);
    const footer = footerRegion(html);
    assert.match(footer, COPYRIGHT, 'footer shows the copyright line');
  });

  test(`footer on ${page} shows nothing besides the copyright line`, async () => {
    const html = await loadBuiltPage(page);
    const footer = footerRegion(html);

    // The old footer button strip was images wrapped in links; none of that
    // may remain, and no other image or link may render in the footer.
    assert.ok(!/<img[\s>]/.test(footer), 'footer has no images');
    assert.ok(!/<svg[\s>]/.test(footer), 'footer has no inline icons');
    assert.ok(!/<a[\s>]/.test(footer), 'footer has no links');

    // Visible text is exactly the copyright line — nothing else renders.
    const visibleText = footer
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const copyright = visibleText.match(COPYRIGHT)?.[0];
    assert.ok(copyright, 'footer shows the copyright line');
    assert.equal(visibleText, copyright, 'the copyright line is the only visible text');
  });
}

test('the button wall keeps every migrated destination with its 88×31 button', async () => {
  const html = await loadBuiltPage('index.html');
  const wall = wallRegion(html);

  for (const destination of MIGRATED_DESTINATIONS) {
    const anchor = wall.match(
      new RegExp(`<a\\s[^>]*href="${escapeRegExp(destination)}"[^>]*>([\\s\\S]*?)</a>`)
    );
    assert.ok(anchor, `button wall links to ${destination}`);

    const img = anchor[1].match(/<img\s[^>]*>/);
    assert.ok(img, `the button at ${destination} shows its image`);
    assert.match(img[0], /\swidth="88"/, `image at ${destination} is 88 wide`);
    assert.match(img[0], /\sheight="31"/, `image at ${destination} is 31 tall`);
  }
});
