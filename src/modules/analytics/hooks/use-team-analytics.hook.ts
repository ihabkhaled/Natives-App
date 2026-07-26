import { useState } from 'react';

import { buildMembersDirectoryQueryOptions } from '@/modules/members';
import { nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { toRemoteQueryView } from '@/shared/view';

import {
  ANALYTICS_MEMBERS_PAGE_SIZE,
  DEFAULT_TEAM_DIMENSION,
  type AnalyticsDimension,
  type AnalyticsPeriodType,
} from '../constants/analytics.constants';
import { buildAnalyticsScreenCopy } from '../helpers/analytics-copy.helper';
import { buildFreshnessStatus } from '../helpers/freshness.helper';
import { buildAnalyticsControls } from '../helpers/series-view.helper';
import {
  buildPlayerOptions,
  buildTeamAnalyticsPanels,
  buildTeamAnalyticsScreenView,
  resolveSeriesPeriods,
} from '../helpers/team-analytics-view.helper';
import {
  buildCohortComparisonQueryOptions,
  buildTeamSeriesQueryOptions,
} from '../queries/analytics.query';
import { playerAnalyticsPath } from '../routes/analytics.paths';
import type { AnalyticsSeries, CohortComparison } from '../types/analytics.types';
import type { TeamAnalyticsScreenView } from '../types/analytics-view.types';
import { useAnalyticsContext } from './use-analytics-context.hook';
import { useAnalyticsRebuild } from './use-analytics-rebuild.hook';

/**
 * View model of the team analytics screen: dimension/period controls, the
 * governed series chart, the privacy-safe cohort panel (suppression is a
 * designed state), and the freshness card whose rebuild concern is delegated
 * to a sub-hook.
 */
export function useTeamAnalytics(): TeamAnalyticsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useAnalyticsContext();
  const navigation = useAppNavigation();

  const [dimension, setDimension] = useState<AnalyticsDimension>(DEFAULT_TEAM_DIMENSION);
  const [periodType, setPeriodType] = useState<AnalyticsPeriodType>('monthly');
  const [cohortPeriodKey, setCohortPeriodKey] = useState('');

  const seriesQuery = toRemoteQueryView<AnalyticsSeries>(
    useAppQuery(buildTeamSeriesQueryOptions(context.teamId, { dimension, periodType })),
  );
  const series = seriesQuery.data ?? null;
  const { periodKeys, activeCohortKey } = resolveSeriesPeriods(series, cohortPeriodKey);

  const cohortQuery = toRemoteQueryView<CohortComparison>(
    useAppQuery(
      buildCohortComparisonQueryOptions(context.teamId, {
        dimension,
        periodType,
        periodKey: activeCohortKey,
      }),
    ),
  );
  const membersQuery = toRemoteQueryView(
    useAppQuery(
      buildMembersDirectoryQueryOptions(context.teamId, { pageSize: ANALYTICS_MEMBERS_PAGE_SIZE }),
    ),
  );

  const rebuild = useAnalyticsRebuild(t, context.teamId, context.isOffline);
  const freshnessStatus = buildFreshnessStatus(
    t,
    locale,
    series?.computedAtIso ?? null,
    Date.parse(nowIso()),
  );

  const panels = buildTeamAnalyticsPanels(t, locale, {
    series,
    locale,
    cohort: cohortQuery.data ?? null,
    periodKeys,
    activeCohortKey,
    onCohortPeriodChange: setCohortPeriodKey,
    freshness: {
      series,
      statusLabel: rebuild.error ?? freshnessStatus.label,
      isStale: freshnessStatus.isStale,
      canRebuild: context.canRebuild,
      isOffline: context.isOffline,
      reportBanner: rebuild.banner,
      dialog: rebuild.dialog,
      onOpenRebuild: rebuild.onOpenRebuild,
    },
  });

  const copy = buildAnalyticsScreenCopy(t, {
    error: seriesQuery.error,
    isOffline: context.isOffline,
    onRetry: seriesQuery.refetch,
  });

  return buildTeamAnalyticsScreenView(t, copy, {
    context,
    seriesQuery,
    controls: buildAnalyticsControls(t, {
      dimension,
      periodType,
      includeTeamOnly: true,
      onDimensionChange: (value) => {
        setDimension(value as AnalyticsDimension);
        setCohortPeriodKey('');
      },
      onPeriodChange: (value) => {
        setPeriodType(value as AnalyticsPeriodType);
        setCohortPeriodKey('');
      },
    }),
    panels,
    playerOptions: buildPlayerOptions(membersQuery.data?.items),
    onPlayerSelect: (membershipId) => {
      navigation.push(playerAnalyticsPath(membershipId));
    },
  });
}
