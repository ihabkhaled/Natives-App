import { useState } from 'react';

import { buildMembersDirectoryQueryOptions } from '@/modules/members';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import {
  ANALYTICS_MEMBERS_PAGE_SIZE,
  DEFAULT_PLAYER_DIMENSION,
  type AnalyticsDimension,
  type AnalyticsPeriodType,
} from '../constants/analytics.constants';
import { buildAnalyticsScreenCopy } from '../helpers/analytics-copy.helper';
import {
  mayReadPlayerSeries,
  resolvePlayerAnalyticsStatus,
  resolvePlayerName,
} from '../helpers/player-analytics-view.helper';
import { buildAnalyticsControls, buildSeriesChartView } from '../helpers/series-view.helper';
import { isAnalyticsScopeNotFound } from '../helpers/to-analytics-error.helper';
import { buildPlayerSeriesQueryOptions } from '../queries/analytics.query';
import { analyticsPagePath } from '../routes/analytics.paths';
import type { AnalyticsSeries } from '../types/analytics.types';
import type { PlayerAnalyticsScreenView } from '../types/analytics-view.types';
import { useAnalyticsContext } from './use-analytics-context.hook';

/**
 * View model of the player analytics screen. The read is dual-gated
 * server-side: analytics.read.team reads any player, analytics.read.self
 * exactly one's own membership — so a member deep-linking to their own page
 * gets their series while any other combination renders the designed
 * forbidden (or not-found) state, never a blank chart.
 */
export function usePlayerAnalytics(): PlayerAnalyticsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useAnalyticsContext();
  const navigation = useAppNavigation();
  const membershipId = useRouteParam('membershipId') ?? '';

  const [dimension, setDimension] = useState<AnalyticsDimension>(DEFAULT_PLAYER_DIMENSION);
  const [periodType, setPeriodType] = useState<AnalyticsPeriodType>('monthly');

  const mayRead = mayReadPlayerSeries(
    membershipId,
    context.membershipId,
    context.canReadTeam,
    context.canReadSelf,
  );

  const seriesQuery = toRemoteQueryView<AnalyticsSeries>(
    useAppQuery(
      buildPlayerSeriesQueryOptions(context.teamId, membershipId, { dimension, periodType }),
    ),
  );
  const membersQuery = toRemoteQueryView(
    useAppQuery(
      buildMembersDirectoryQueryOptions(context.teamId, { pageSize: ANALYTICS_MEMBERS_PAGE_SIZE }),
    ),
  );
  const series = seriesQuery.data ?? null;
  const isScopeMissing = isAnalyticsScopeNotFound(seriesQuery.error);
  const playerName = resolvePlayerName(membersQuery.data?.items, membershipId);

  return {
    ...buildAnalyticsScreenCopy(t, {
      error: seriesQuery.error,
      isOffline: context.isOffline,
      onRetry: seriesQuery.refetch,
    }),
    status: resolvePlayerAnalyticsStatus({
      isLoading: context.isLoading,
      mayRead,
      isOffline: context.isOffline,
      isScopeMissing,
      query: seriesQuery,
    }),
    title: t(I18N_KEYS.analytics.playerTitle),
    subtitle: t(I18N_KEYS.analytics.playerSubtitle),
    identityLabel: playerName,
    backLabel: t(I18N_KEYS.analytics.playerBack),
    onBack: () => {
      navigation.push(analyticsPagePath());
    },
    controls: buildAnalyticsControls(t, {
      dimension,
      periodType,
      includeTeamOnly: false,
      onDimensionChange: (value) => {
        setDimension(value as AnalyticsDimension);
      },
      onPeriodChange: (value) => {
        setPeriodType(value as AnalyticsPeriodType);
      },
    }),
    chart: series === null ? null : buildSeriesChartView(t, locale, series),
    notFoundTitle: t(I18N_KEYS.analytics.scopeNotFoundTitle),
    notFoundMessage: t(I18N_KEYS.analytics.scopeNotFoundMessage),
    isScopeMissing,
  };
}
