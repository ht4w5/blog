// Helper for the built-HTML test seam: loads pages exactly as `pnpm build`
// emits them into dist/. Run these tests via `pnpm test`, which builds first.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');

/** Load a built page from dist/ by its output path, e.g. 'index.html'. */
export async function loadBuiltPage(relativePath) {
  return readFile(path.join(distDir, relativePath), 'utf8');
}
