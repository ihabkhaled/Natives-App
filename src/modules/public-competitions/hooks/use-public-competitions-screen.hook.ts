import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, toRemoteQueryView } from '@/shared/view';

import { PUBLIC_SHOWCASE_LIVE } from '../constants/public-showcase.constants';
import {
  buildPublicCompetitionsLabels,
  PUBLIC_SHOWCASE_COPY_KEYS,
} from '../helpers/public-showcase-copy.helper';
import { toPublicCompetitionCardView } from '../mappers/public-competition.mapper';
import { buildPublicCompetitionsQueryOptions } from '../queries/public-competitions.query';
import { publicCompetitionsPath } from '../routes/public-competitions.paths';
import type { PublicCompetitionsScreenView } from '../types/public-competitions-view.types';

/**
 * View model for the public competitions list. The read goes through
 * TanStack Query even while the source is the local seam, so the screen has
 * real loading/error/empty states today and needs no rewiring when the
 * service starts calling the 1.8.0 endpoint.
 */
export function usePublicCompetitionsScreen(): PublicCompetitionsScreenView {
  const { t, locale } = useAppTranslation();
  const navigation = useAppNavigation();
  const keys = I18N_KEYS.publicCompetitions;
  const query = toRemoteQueryView(useAppQuery(buildPublicCompetitionsQueryOptions()));
  const cards = (query.data ?? []).map((dto) => toPublicCompetitionCardView(dto, locale, t));
  return {
    ...buildScreenCopy(t, {
      keys: PUBLIC_SHOWCASE_COPY_KEYS,
      error: query.error,
      isOffline: false,
      onRetry: query.refetch,
      emptyTitleKey: keys.emptyTitle,
      emptyMessageKey: keys.emptyMessage,
    }),
    path: publicCompetitionsPath(),
    seoTitle: `${t(keys.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.metaDescription),
    heroEyebrow: t(keys.heroEyebrow),
    heroTitle: t(keys.heroTitle),
    heroIntro: t(keys.heroIntro),
    listHeading: t(keys.listHeading),
    listIntro: t(keys.listIntro),
    seamNoticeTitle: t(keys.seamNoticeTitle),
    seamNoticeMessage: t(keys.seamNoticeMessage),
    isSeamNoticeVisible: !PUBLIC_SHOWCASE_LIVE,
    status: resolveAsyncViewStatus({
      isForbidden: false,
      isLoading: query.isLoading,
      hasError: query.error !== null,
      isOffline: false,
      hasData: query.data !== undefined,
      hasItems: cards.length > 0,
    }),
    labels: buildPublicCompetitionsLabels(t),
    cards,
    onOpenCompetition: (detailPath: string) => {
      navigation.push(detailPath);
    },
  };
}
