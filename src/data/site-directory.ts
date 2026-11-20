/** One destination listed in the site directory. */
export interface DirectoryEntry {
  /**
   * Destination: a root-relative path within this site (e.g. '/about') or an
   * absolute http(s) URL. Root-relative paths link in the same tab; absolute
   * URLs open in a new tab with safe rel attributes.
   */
  href: `/${string}` | `http://${string}` | `https://${string}`;
  /** Optional one-line description, shown as a muted line under the label. */
  description?: string;
}

/**
 * The site directory's directory entries. The order of this array is the
 * display order in the site directory — adding or reordering entries is a
 * data-file edit only. Each entry's label is its URL, rendered in monospace.
 */
export const directoryEntries = [
  {
    href: '/csim',
    description: 'Cache simulator matrix transpose results. https://github.com/ht4w5/csim.',
  },
] satisfies DirectoryEntry[];
