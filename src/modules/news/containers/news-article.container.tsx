import { NewsArticleView } from '../components/news-article-view';
import { useNewsArticle } from '../hooks/use-news-article.hook';

/** Public story detail: view model in, presentational component out. */
export function NewsArticleContainer(): React.JSX.Element {
  const screen = useNewsArticle();
  return <NewsArticleView {...screen} />;
}
