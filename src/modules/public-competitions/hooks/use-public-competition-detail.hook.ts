import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, toRemoteQueryView } from '@/shared/view';

import { COMPETITION_SLUG_PARAM } from '../constants/public-showcase.constants';
import {
  buildPublicCompetitionsLabels,
  buildPublicLeaderboardLabels,
  buildPublicMatchesLabels,
  PUBLIC_SHOWCASE_COPY_KEYS,
} from '../helpers/public-showcase-copy.helper';
import { buildPublicShowcaseSections } from '../helpers/public-showcase-sections.helper';
import { buildPublicCompetitionQueryOptions } from '../queries/public-competitions.query';
import {
  publicCompetitionDetailPath,
  publicCompetitionsPath,
} from '../routes/public-competitions.paths';
import type { PublicCompetitionDetailScreenView } from '../types/public-competitions-view.types';

/**
 * View model for one public competition page: the team's finish, the match
 * results (each row expandable into that game's individual player scores),
 * and the per-competition individual leaderboard. A slug the showcase does
 * not know resolves to `null` and lands on the designed not-found copy rather
 * than on an empty page.
 */
export function usePublicCompetitionDetailScreen(): PublicCompetitionDetailScreenView {
  const { t, locale } = useAppTranslation();
  const navigation = useAppNavigation();
  const keys = I18N_KEYS.publicCompetitions;
  const slug = useRouteParam(COMPETITION_SLUG_PARAM) ?? '';
  const [expandedMatchKey, setExpandedMatchKey] = useState<string | null>(null);
  const query = toRemoteQueryView(useAppQuery(buildPublicCompetitionQueryOptions(slug)));
  const sections = buildPublicShowcaseSections(query.data ?? null, locale, t);
  const title = sections.summary?.name ?? t(keys.title);
  return {
    ...buildScreenCopy(t, {
      keys: PUBLIC_SHOWCASE_COPY_KEYS,
      error: query.error,
      isOffline: false,
      onRetry: query.refetch,
      emptyTitleKey: keys.detailNotFoundTitle,
      emptyMessageKey: keys.detailNotFoundMessage,
    }),
    path: publicCompetitionDetailPath(slug),
    seoTitle: `${title} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.detailMetaDescription, { competition: title }),
    heroEyebrow: t(keys.heroEyebrow),
    title,
    backLabel: t(keys.backToList),
    onBack: () => {
      navigation.push(publicCompetitionsPath());
    },
    status: resolveAsyncViewStatus({
      isForbidden: false,
      isLoading: query.isLoading,
      hasError: query.error !== null,
      isOffline: false,
      hasData: query.data !== undefined,
      hasItems: sections.summary !== null,
    }),
    summary: sections.summary,
    summaryLabels: buildPublicCompetitionsLabels(t),
    matchesHeading: t(keys.matchesHeading),
    matchesIntro: t(keys.matchesIntro),
    matchesLabels: buildPublicMatchesLabels(t),
    matches: sections.matches,
    expandedMatchKey,
    onToggleMatch: (key: string) => {
      setExpandedMatchKey((current) => (current === key ? null : key));
    },
    leaderboardHeading: t(keys.leaderboardHeading),
    leaderboardIntro: t(keys.leaderboardIntro),
    leaderboardLabels: buildPublicLeaderboardLabels(t),
    leaderboard: sections.leaderboard,
  };
}
