import { APP_PATHS } from '@/shared/config';

export const NEWS_SLUG_PARAM = 'slug';

/** Route pattern and navigation target for the public news list. */
export function newsPath(): string {
  return APP_PATHS.news;
}

/** Route pattern for one public article. */
export function newsArticlePattern(): string {
  return APP_PATHS.newsArticle;
}

/** Navigation target for one public article. */
export function newsArticlePath(slug: string): string {
  return APP_PATHS.newsArticle.replace(`:${NEWS_SLUG_PARAM}`, encodeURIComponent(slug));
}

/** Route pattern and navigation target for the permissioned newsroom. */
export function newsManagePath(): string {
  return APP_PATHS.newsManage;
}
