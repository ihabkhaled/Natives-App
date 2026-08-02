import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { newsArticlePath, newsArticlePattern, newsManagePath, newsPath } from './news.paths';

describe('news paths', () => {
  it('builds the list and editor targets from the canonical table', () => {
    expect(newsPath()).toBe(APP_PATHS.news);
    expect(newsManagePath()).toBe(APP_PATHS.newsManage);
    expect(newsArticlePattern()).toBe(APP_PATHS.newsArticle);
  });

  it('substitutes the slug into the detail pattern', () => {
    expect(newsArticlePath('first-league-win')).toBe('/news/first-league-win');
  });

  it('encodes a slug that would otherwise change the path shape', () => {
    expect(newsArticlePath('a/b?c')).toBe('/news/a%2Fb%3Fc');
  });
});
