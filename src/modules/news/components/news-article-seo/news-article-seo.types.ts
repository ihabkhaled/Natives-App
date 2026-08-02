export interface NewsArticleSeoProps {
  readonly title: string;
  readonly description: string;
  /** Route path (e.g. `/news/first-win`), resolved against the site origin. */
  readonly path: string;
  /** The story's cover image, or null to fall back to the club logo. */
  readonly imageUrl: string | null;
  /** ISO instant for `article:published_time`, or null while unpublished. */
  readonly publishedTime: string | null;
  readonly author: string;
}
