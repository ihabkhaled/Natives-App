import { TEST_IDS } from '@/shared/config';

import { NewsArticleBlock } from '../news-article-block';
import type { NewsArticleBodyProps } from './news-article-body.types';

/**
 * A story's body, rendered from typed blocks. There is no HTML string
 * anywhere in this path: the Markdown source was parsed into values upstream
 * and React escapes every one of them on the way out.
 */
export function NewsArticleBody(props: NewsArticleBodyProps): React.JSX.Element {
  return (
    <div data-testid={TEST_IDS.newsArticleBody} className="app-news-body">
      {props.blocks.map((block) => (
        <NewsArticleBlock key={block.key} block={block} />
      ))}
    </div>
  );
}
