import { NewsRichText } from '../news-rich-text';
import {
  NEWS_BLOCK_TAGS,
  NEWS_HEADING_TAGS,
  NEWS_LINE_TAGS,
} from './news-article-block.constants';
import type { NewsArticleBlockProps } from './news-article-block.types';

/**
 * One parsed block of a story. Both the container and the line element come
 * from a lookup keyed by the kind the parser assigned, so the view makes no
 * decision about what an author wrote — it only renders the decision.
 */
export function NewsArticleBlock(props: NewsArticleBlockProps): React.JSX.Element {
  const { block } = props;
  const Tag = NEWS_HEADING_TAGS[block.level] ?? NEWS_BLOCK_TAGS[block.kind];
  const LineTag = NEWS_LINE_TAGS[block.kind];
  return (
    <Tag className={`app-news-body__block app-news-body__block--${block.kind}`}>
      {block.lines.map((line) => (
        <LineTag key={line.key} className="app-news-body__line">
          <NewsRichText spans={line.spans} />
        </LineTag>
      ))}
    </Tag>
  );
}
