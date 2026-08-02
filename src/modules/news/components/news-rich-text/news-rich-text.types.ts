import type { NewsSpan } from '../../types/news-markdown.types';

export interface NewsRichTextProps {
  readonly spans: readonly NewsSpan[];
}
