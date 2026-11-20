/** One destination listed in the site directory. */
export interface DirectoryEntry {
  /**
   * Destination: a root-relative path within this site (e.g. '/about') or an
   * absolute http(s) URL. Root-relative paths link in the same tab; absolute
   * URLs open in a new tab with safe rel attributes.
   */
  href: `/${string}` | `http://${string}` | `https://${string}`;
  /** Label shown as the link text. */
  label: string;
  /** Optional one-line description, shown as a muted line under the label. */
  description?: string;
}

/**
 * The site directory's directory entries. The order of this array is the
 * display order on the /paths page — adding or reordering entries is a
 * data-file edit only.
 */
export const directoryEntries = [
  {
    href: '/about',
    label: 'about',
    description: 'Who writes this blog, and why.',
  },
  {
    href: '/tags',
    label: 'tags',
    description: 'Browse every tag used on the blog.',
  },
  {
    href: '/feed.xml',
    label: 'feed',
  },
  {
    href: 'https://github.com/ht4w5/blog',
    label: 'blog source',
    description: 'The code that builds this site, on GitHub.',
  },
] satisfies DirectoryEntry[];
