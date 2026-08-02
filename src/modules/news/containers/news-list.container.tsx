import { NewsListView } from '../components/news-list-view';
import { useNewsList } from '../hooks/use-news-list.hook';

/** Public news list: view model in, presentational component out. */
export function NewsListContainer(): React.JSX.Element {
  const screen = useNewsList();
  return <NewsListView {...screen} />;
}
