/**
 * Button wall data — the homepage's dense row of classic 88×31 web buttons.
 *
 * One entry per wall position; array order is display order (flat list, no
 * categories). An entry with `href` is a linked button; an entry without one
 * is a flair badge (decorative, not clickable).
 *
 * Art lives in `public/buttons/` as 88×31 pixel files. The files there today
 * are solid-colour placeholders — replace one in place (same filename) to
 * drop in real art; the paths below are the stable contract.
 */

export interface ButtonEntry {
  /** Stable identifier, unique within the wall. */
  id: string;
  /** Descriptive alt text for the image (required). */
  alt: string;
  /** Site path (e.g. '/buttons/ht4w5.png') or external URL to the 88×31 art. */
  imageSrc: string;
  /** Destination; omit for a flair badge. */
  href?: string;
  /** Hover tooltip. */
  title?: string;
}

export const buttons: ButtonEntry[] = [
  {
    id: 'ht4w5',
    alt: 'ht4w5\'s blog',
    imageSrc: '/buttons/ht4w5.png',
    href: 'https://ht4w5.github.io',
  },
  {
    id: 'cc-by-nc-sa',
    alt: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International',
    imageSrc: '/buttons/cc-by-nc-sa.png',
    href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  {
    id: 'github',
    alt: 'ht4w5\'s GitHub',
    imageSrc: '/buttons/github.png',
    href: 'https://github.com/ht4w5',
  },
  {
    id: 'rss',
    alt: 'Rich Site Summary',
    imageSrc: '/buttons/rss.png',
    href: 'https://ht4w5.github.io/feed.xml'
  }
];
