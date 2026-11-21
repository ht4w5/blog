// Fixture-site builder for the browser seam (nav-posts-search ticket 03).
// The live content set has fewer than 10 posts, so the 10-cap and the
// removed pagination route can only be observed on a build with more posts
// than the site will ever hold. This helper generates fixture posts with
// known titles, dates, and tags into the content collection, builds the site
// with them to a separate output dir (ASTRO_OUT_DIR, see astro.config.mjs),
// and serves that output the way the real static host serves it. Callers
// must dispose the site even when assertions fail, so the fixture posts
// never outlive the test run.
import { execFileSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDir } from '../static-server.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contentDir = path.join(repoRoot, 'src/content/blog');
const outDir = path.join(repoRoot, 'dist-fixture');

/** How many fixture posts the fixture site holds (more than the 10-cap and more than one tag page). */
export const FIXTURE_COUNT = 24;

/** A fixture post's visible title, e.g. 'Fixture post 07'; numbers order newest-first. */
export function fixtureTitle(n: number): string {
  return `Fixture post ${String(n).padStart(2, '0')}`;
}

const fixtureId = (n: number) => `fixture-post-${String(n).padStart(2, '0')}`;

/** Fixture post n: dated 2027-01-n (newer than every live post), tagged 'fixture'. */
function fixtureMarkdown(n: number): string {
  return [
    '---',
    `title: "${fixtureTitle(n)}"`,
    `date: 2027-01-${String(n).padStart(2, '0')}`,
    `description: "Fixture description ${n}."`,
    'tags: ["fixture"]',
    'draft: false',
    '---',
    '',
    `Fixture body ${n}.`,
    '',
  ].join('\n');
}

export async function removeFixturePosts(): Promise<void> {
  for (let n = 1; n <= FIXTURE_COUNT; n++) {
    await rm(path.join(contentDir, fixtureId(n)), { recursive: true, force: true });
  }
}

export async function removeFixtureOutput(): Promise<void> {
  await rm(outDir, { recursive: true, force: true });
}

export interface FixtureSite {
  url: string;
  dispose(): Promise<void>;
}

/**
 * Generate the fixture posts, build the fixture site, and serve it.
 * On any failure the fixture posts and output are removed again; callers
 * still dispose on success (and defensively on failure) so nothing outlives
 * the test run.
 */
export async function buildFixtureSite(): Promise<FixtureSite> {
  // Start clean: a previous crashed run may have left fixtures behind.
  await removeFixturePosts();
  await removeFixtureOutput();

  for (let n = 1; n <= FIXTURE_COUNT; n++) {
    const dir = path.join(contentDir, fixtureId(n));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.md'), fixtureMarkdown(n));
  }

  try {
    execFileSync('pnpm', ['run', 'build'], {
      cwd: repoRoot,
      env: { ...process.env, ASTRO_OUT_DIR: 'dist-fixture' },
      stdio: 'pipe',
    });
  } catch (error) {
    await removeFixturePosts();
    await removeFixtureOutput();
    throw error;
  }

  const server = await serveDir(outDir);
  return {
    url: server.url,
    async dispose() {
      await server.close();
      await removeFixturePosts();
      await removeFixtureOutput();
    },
  };
}
