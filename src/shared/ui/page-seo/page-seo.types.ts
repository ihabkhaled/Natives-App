export interface PageSeoProps {
  /** Document title (tab title + og:title/twitter:title). */
  readonly title: string;
  /** Meta description, kept to search-snippet length by the caller. */
  readonly description: string;
  /** Route path (e.g. `/about`), resolved against the canonical site origin. */
  readonly path: string;
}
