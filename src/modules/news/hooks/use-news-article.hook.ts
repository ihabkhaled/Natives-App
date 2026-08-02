import { useMemo } from 'react';

import { formatDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { buildNewsArticleFacts } from '../helpers/news-article-view.helper';
import { buildPublicNewsCopy, resolveNewsScreenStatus } from '../helpers/news-copy.helper';
import { NEWS_ENDPOINTS_ENABLED } from '../news.constants';
import { parseNewsMarkdown } from '../parsers/news-markdown.parser';
import { NEWS_SLUG_PARAM, newsArticlePath, newsPath } from '../routes/news.paths';
import type { NewsArticleScreenView } from '../types/news-view.types';
import { useNewsArticleQuery } from './use-news-article-query.hook';
import { useNewsContext } from './use-news-context.hook';

/**
 * Prepared, translated view model for `/news/:slug`. The body is parsed into
 * typed blocks here, so the view renders React elements and never HTML — a
 * story is untrusted, author-supplied content on a public page.
 */
export function useNewsArticle(): NewsArticleScreenView {
  const { t, locale } = useAppTranslation();
  const context = useNewsContext();
  const navigation = useAppNavigation();
  const slug = useRouteParam(NEWS_SLUG_PARAM) ?? '';
  const query = useNewsArticleQuery(slug);
  const article = query.data?.article ?? null;
  const blocks = useMemo(() => parseNewsMarkdown(article?.body ?? ''), [article?.body]);
  const facts = buildNewsArticleFacts(
    t,
    (isoDate: string) => formatDate(isoDate, locale),
    article,
  );

  return {
    ...buildPublicNewsCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      isSeamLive: NEWS_ENDPOINTS_ENABLED,
    }),
    // A story that is not published is not "an empty list" — say what it is.
    emptyTitle: t(I18N_KEYS.news.articleMissingTitle),
    emptyMessage: t(I18N_KEYS.news.articleMissingMessage),
    path: newsArticlePath(slug),
    seoTitle: `${facts.heading} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: facts.excerpt === '' ? t(I18N_KEYS.news.metaDescription) : facts.excerpt,
    seoImageUrl: facts.coverImageUrl,
    seoPublishedTime: facts.publishedAt,
    status: resolveNewsScreenStatus(context, query, true, article !== null),
    title: facts.heading,
    heading: facts.heading,
    backLabel: t(I18N_KEYS.news.backToList),
    onBack: () => {
      navigation.push(newsPath());
    },
    bylineLabel: facts.bylineLabel,
    dateLabel: facts.dateLabel,
    author: facts.author,
    coverImageUrl: facts.coverImageUrl,
    coverAlt: facts.coverAlt,
    blocks,
    linkLabels: facts.linkLabels,
  };
}
