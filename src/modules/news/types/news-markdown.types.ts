import type { NEWS_BLOCK_KIND, NEWS_SPAN_KIND } from '../parsers/news-markdown.constants';

export type NewsBlockKind = (typeof NEWS_BLOCK_KIND)[keyof typeof NEWS_BLOCK_KIND];

export type NewsSpanKind = (typeof NEWS_SPAN_KIND)[keyof typeof NEWS_SPAN_KIND];

/**
 * One inline run of a story. `href` is non-null only for a `link` span whose
 * target passed the scheme allowlist; every other span renders as escaped
 * text inside its element.
 */
export interface NewsSpan {
  readonly key: string;
  readonly kind: NewsSpanKind;
  readonly text: string;
  readonly href: string | null;
}

/**
 * One block of a story. `lines` holds one entry per rendered line: a single
 * entry for a heading, paragraph or quote, one per item for a list, and one
 * per source line for a code block.
 */
export interface NewsBlock {
  readonly key: string;
  readonly kind: NewsBlockKind;
  /** Heading level 2-3; 0 for every other kind. */
  readonly level: number;
  readonly lines: readonly NewsBlockLine[];
}

export interface NewsBlockLine {
  readonly key: string;
  readonly spans: readonly NewsSpan[];
}
