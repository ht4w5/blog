// A minimal static file server for the test seams, answering requests the
// way the real static host does: clean URLs resolve to `<path>/index.html`,
// and unknown paths fall through to the site's `404.html` with status 404
// (the same contract astro preview and GitHub Pages serve). Used by the
// built-HTML seam (page requests over the standard build) and the browser
// seam (serving fixture builds). Assert with it only what a visitor
// receives — status codes, visible text, navigation — never markup
// internals.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface StaticServer {
  url: string;
  close(): Promise<void>;
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function contentType(file: string): string {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

async function handle(root: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const relative = pathname.replace(/^\/+/, '');
  // Clean-URL candidates, most specific first (mirrors astro preview).
  const candidates = pathname.endsWith('/')
    ? [path.join(relative, 'index.html')]
    : [path.join(relative, 'index.html'), `${relative}.html`, relative];

  for (const candidate of candidates) {
    const file = path.resolve(root, candidate);
    if (!file.startsWith(root + path.sep)) continue; // never serve outside the root
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': contentType(file) });
      res.end(body);
      return;
    } catch {
      // Not this candidate; try the next.
    }
  }

  try {
    const notFound = await readFile(path.join(root, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(notFound);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

/** Serve `rootDir` on an ephemeral port; the caller closes the server. */
export async function serveDir(rootDir: string): Promise<StaticServer> {
  const root = path.resolve(rootDir);
  const server = createServer((req, res) => {
    void handle(root, req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
