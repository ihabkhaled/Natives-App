import { NEWS_SPAN_KIND } from '../../parsers/news-markdown.constants';
import type { NewsSpanKind } from '../../types/news-markdown.types';

/** The exact element names an inline run may render as — never author input. */
type NewsSpanTag = 'span' | 'strong' | 'em' | 'code' | 'a';

/**
 * The element each inline kind renders as. A lookup, not a branch: the parser
 * has already decided what every run is, so the view only names its tag.
 */
export const NEWS_SPAN_TAGS: Readonly<Record<NewsSpanKind, NewsSpanTag>> = {
  [NEWS_SPAN_KIND.Text]: 'span',
  [NEWS_SPAN_KIND.Strong]: 'strong',
  [NEWS_SPAN_KIND.Emphasis]: 'em',
  [NEWS_SPAN_KIND.Code]: 'code',
  [NEWS_SPAN_KIND.Link]: 'a',
};
