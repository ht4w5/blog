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
    alt: 'ht4w5 blog button linking to this site',
    imageSrc: '/buttons/ht4w5.png',
    href: '/',
    title: 'ht4w5 — link to me',
  },
  {
    id: 'cc-by-nc-sa',
    alt: 'CC BY-NC-SA 4.0 licence button',
    imageSrc: '/buttons/cc-by-nc-sa.png',
    href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    title: 'Content licensed under CC BY-NC-SA 4.0',
  },
  {
    id: 'xjtumen',
    alt: 'xjtumen button linking to xjtu.app',
    imageSrc: '/buttons/xjtumen.png',
    href: 'https://xjtu.app/',
  },
  {
    id: 'github',
    alt: 'GitHub button linking to ht4w5 on GitHub',
    imageSrc: '/buttons/github.png',
    href: 'https://github.com/ht4w5',
  },
  {
    id: 'under-construction',
    alt: 'Under construction flair badge',
    imageSrc: '/buttons/under-construction.png',
  },
];
