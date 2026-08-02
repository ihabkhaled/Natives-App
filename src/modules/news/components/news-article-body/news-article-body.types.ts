import type { NewsBlock } from '../../types/news-markdown.types';

export interface NewsArticleBodyProps {
  readonly blocks: readonly NewsBlock[];
}
