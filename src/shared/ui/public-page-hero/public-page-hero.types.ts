export interface PublicPageHeroProps {
  readonly eyebrow: string;
  readonly title: string;
  /** Optional lede under the title; omitted where a page has none. */
  readonly intro?: string;
  /** Defaults to the shared marketing hero; pass to keep a page's own skin. */
  readonly className?: string;
}
