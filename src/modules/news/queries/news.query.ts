import { getPublishedNewsArticle } from '../services/get-published-news-article.service';
import { listManagedNews } from '../services/list-managed-news.service';
import { listPublishedNews } from '../services/list-published-news.service';
import { newsQueryKeys } from './news.keys';

export function buildPublishedNewsQueryOptions(page: number) {
  return {
    queryKey: newsQueryKeys.published(page),
    queryFn: () => listPublishedNews(page),
  };
}

export function buildNewsArticleQueryOptions(slug: string) {
  return {
    queryKey: newsQueryKeys.article(slug),
    queryFn: () => getPublishedNewsArticle(slug),
    /** No slug means no route match yet; a read with an empty key is noise. */
    enabled: slug !== '',
  };
}

export function buildManagedNewsQueryOptions(page: number, permitted: boolean) {
  return {
    queryKey: newsQueryKeys.managed(page),
    queryFn: () => listManagedNews(page),
    /** Never issue the authoring read for a session without the grant. */
    enabled: permitted,
  };
}
