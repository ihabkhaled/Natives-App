import { NEWS_BLOCK_KIND } from '../../parsers/news-markdown.constants';
import type { NewsBlockKind } from '../../types/news-markdown.types';

/** The exact element names a story may render as — never author input. */
type NewsBlockTag = 'h2' | 'h3' | 'p' | 'blockquote' | 'pre' | 'ul' | 'ol';
type NewsLineTag = 'span' | 'code' | 'li';

/** The container element each block kind renders as. */
export const NEWS_BLOCK_TAGS: Readonly<Record<NewsBlockKind, NewsBlockTag>> = {
  [NEWS_BLOCK_KIND.Heading]: 'h2',
  [NEWS_BLOCK_KIND.Paragraph]: 'p',
  [NEWS_BLOCK_KIND.Quote]: 'blockquote',
  [NEWS_BLOCK_KIND.Code]: 'pre',
  [NEWS_BLOCK_KIND.Bullets]: 'ul',
  [NEWS_BLOCK_KIND.Numbers]: 'ol',
};

/** The element each rendered line inside a block gets. */
export const NEWS_LINE_TAGS: Readonly<Record<NewsBlockKind, NewsLineTag>> = {
  [NEWS_BLOCK_KIND.Heading]: 'span',
  [NEWS_BLOCK_KIND.Paragraph]: 'span',
  [NEWS_BLOCK_KIND.Quote]: 'span',
  [NEWS_BLOCK_KIND.Code]: 'code',
  [NEWS_BLOCK_KIND.Bullets]: 'li',
  [NEWS_BLOCK_KIND.Numbers]: 'li',
};

/**
 * A story may not start an `h1` — the page already owns one — so `#` and `##`
 * land on `h2` and anything deeper on `h3`. Heading depth is author input,
 * and author input never decides the document outline.
 */
export const NEWS_HEADING_TAGS: Readonly<Record<number, NewsBlockTag>> = {
  2: 'h2',
  3: 'h3',
};
