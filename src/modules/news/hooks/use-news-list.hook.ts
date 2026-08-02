import { formatDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { buildNewsCard } from '../helpers/news-card.helper';
import { buildPublicNewsCopy, resolveNewsScreenStatus } from '../helpers/news-copy.helper';
import { NEWS_ENDPOINTS_ENABLED, NEWS_FIRST_PAGE } from '../news.constants';
import { newsArticlePath, newsManagePath, newsPath } from '../routes/news.paths';
import type { NewsListScreenView } from '../types/news-view.types';
import { useNewsContext } from './use-news-context.hook';
import { usePublishedNewsQuery } from './use-published-news-query.hook';

/**
 * Prepared, translated view model for the public `/news` list. Reading needs
 * no grant, so the screen is never forbidden; `manageLabel` is the only piece
 * that depends on a permission, and it is null — not disabled — for everyone
 * who cannot write, so a player is never shown an affordance they lack.
 */
export function useNewsList(): NewsListScreenView {
  const { t, locale } = useAppTranslation();
  const context = useNewsContext();
  const navigation = useAppNavigation();
  const query = usePublishedNewsQuery(NEWS_FIRST_PAGE);
  const page = query.data?.page ?? { items: [], total: 0 };
  const formatDay = (isoDate: string): string => formatDate(isoDate, locale);

  return {
    ...buildPublicNewsCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      isSeamLive: NEWS_ENDPOINTS_ENABLED,
    }),
    path: newsPath(),
    seoTitle: `${t(I18N_KEYS.news.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(I18N_KEYS.news.metaDescription),
    status: resolveNewsScreenStatus(context, query, true, page.items.length > 0),
    eyebrow: t(I18N_KEYS.news.heroEyebrow),
    title: t(I18N_KEYS.news.title),
    subtitle: t(I18N_KEYS.news.subtitle),
    countLabel: t(I18N_KEYS.news.countSummary, {
      shown: page.items.length,
      total: page.total,
    }),
    readMoreLabel: t(I18N_KEYS.news.readMore),
    items: page.items.map((article) => buildNewsCard(t, formatDay, article)),
    onOpen: (slug: string) => {
      navigation.push(newsArticlePath(slug));
    },
    manageLabel: context.canManage ? t(I18N_KEYS.newsEditor.navLabel) : null,
    onManage: () => {
      navigation.push(newsManagePath());
    },
  };
}
