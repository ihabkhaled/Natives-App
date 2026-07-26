import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { RemoteQueryView, ScreenCopy } from '@/shared/view';
import { resolveScreenStatus } from '@/shared/view';

import {
  REBUILD_DEFAULT_PERIOD_TYPE,
  type AnalyticsPeriodType,
} from '../constants/analytics.constants';
import type { AnalyticsSeries, CohortComparison } from '../types/analytics.types';
import type {
  AnalyticsControlsView,
  CohortPanelView,
  FreshnessCardView,
  RebuildDialogView,
  SeriesChartView,
  TeamAnalyticsScreenView,
} from '../types/analytics-view.types';
import { buildCohortBody } from './cohort-view.helper';
import { buildSeriesChartView, resolvePeriodTypeLabel } from './series-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** The period keys of a series and the cohort key currently in focus. */
export function resolveSeriesPeriods(
  series: AnalyticsSeries | null,
  cohortPeriodKey: string,
): { readonly periodKeys: readonly string[]; readonly activeCohortKey: string } {
  const periodKeys = (series?.points ?? []).map((point) => point.periodKey);
  return {
    periodKeys,
    activeCohortKey: cohortPeriodKey === '' ? (periodKeys.at(-1) ?? '') : cohortPeriodKey,
  };
}

/** The player-select options from the members directory. */
export function buildPlayerOptions(
  members: readonly { readonly membershipId: string; readonly displayName: string }[] | undefined,
): readonly SelectFieldOption[] {
  return (members ?? []).map((member) => ({
    value: member.membershipId,
    label: member.displayName,
  }));
}

/** The team analytics status from the series query and the read grant. */
export function resolveTeamAnalyticsStatus(
  scope: { readonly isOffline: boolean; readonly isLoading: boolean },
  query: RemoteQueryView<AnalyticsSeries>,
  canReadTeam: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(scope, query, canReadTeam, (query.data?.points.length ?? 0) > 0);
}

/** Resolved state + callbacks the cohort panel binds. */
interface CohortPanelInputs {
  readonly cohort: CohortComparison | null;
  readonly periodKeys: readonly string[];
  readonly activeKey: string;
  readonly onPeriodChange: (value: string) => void;
}

/** The cohort panel, with suppression as a first-class body state. */
function buildCohortPanelView(t: Translate, inputs: CohortPanelInputs): CohortPanelView {
  const base = {
    heading: t(I18N_KEYS.analytics.cohortHeading),
    intro: t(I18N_KEYS.analytics.cohortIntro),
    periodLabel: t(I18N_KEYS.analytics.cohortPeriodLabel),
    periodValue: inputs.activeKey,
    periodOptions: inputs.periodKeys.map((key) => ({ value: key, label: key })),
    onPeriodChange: inputs.onPeriodChange,
  };
  if (inputs.cohort === null) {
    return {
      ...base,
      tiles: [],
      sampleLabel: null,
      suppressedTitle: null,
      suppressedMessage: null,
      emptyLabel: t(I18N_KEYS.analytics.cohortEmpty),
    };
  }
  return { ...base, ...buildCohortBody(t, inputs.cohort), emptyLabel: null };
}

/** Resolved state + callbacks the rebuild dialog binds. */
export interface RebuildDialogInputs {
  readonly periodValue: string;
  readonly isOffline: boolean;
  readonly isRunning: boolean;
  readonly onPeriodChange: (value: string) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** The rebuild dialog with the DTO's monthly default and two coarser periods. */
export function buildRebuildDialogView(
  t: Translate,
  inputs: RebuildDialogInputs,
): RebuildDialogView {
  return {
    heading: t(I18N_KEYS.analytics.rebuildHeading),
    intro: t(I18N_KEYS.analytics.rebuildIntro),
    periodLabel: t(I18N_KEYS.analytics.rebuildPeriodLabel),
    periodValue: inputs.periodValue,
    periodOptions: (
      [REBUILD_DEFAULT_PERIOD_TYPE, 'season', 'all_time'] as readonly AnalyticsPeriodType[]
    ).map((value) => ({ value, label: resolvePeriodTypeLabel(t, value) })),
    onPeriodChange: inputs.onPeriodChange,
    confirmLabel: t(I18N_KEYS.analytics.rebuildConfirm),
    cancelLabel: t(I18N_KEYS.analytics.rebuildCancel),
    canConfirm: !inputs.isOffline && !inputs.isRunning,
    isRunning: inputs.isRunning,
    onConfirm: inputs.onConfirm,
    onCancel: inputs.onCancel,
  };
}

/** Resolved state + callbacks the freshness card binds. */
export interface FreshnessCardInputs {
  readonly series: AnalyticsSeries | null;
  readonly statusLabel: string;
  readonly isStale: boolean;
  readonly canRebuild: boolean;
  readonly isOffline: boolean;
  readonly reportBanner: string | null;
  readonly dialog: RebuildDialogView | null;
  readonly onOpenRebuild: () => void;
}

/** The freshness card; the rebuild affordance is absent (not disabled) without the grant. */
export function buildFreshnessCardView(
  t: Translate,
  inputs: FreshnessCardInputs,
): FreshnessCardView | null {
  if (inputs.series === null) {
    return null;
  }
  return {
    heading: t(I18N_KEYS.analytics.freshnessHeading),
    statusLabel: inputs.statusLabel,
    isStale: inputs.isStale,
    staleBadgeLabel: inputs.isStale ? t(I18N_KEYS.analytics.freshnessHeading) : null,
    rebuildLabel: inputs.canRebuild ? t(I18N_KEYS.analytics.rebuildOpen) : null,
    onOpenRebuild: inputs.onOpenRebuild,
    rebuildDisabledReason: inputs.isOffline ? t(I18N_KEYS.analytics.offlineMessage) : null,
    dialog: inputs.dialog,
    reportBanner: inputs.reportBanner,
  };
}

/** The three main panels of the team screen, assembled from resolved state. */
export interface TeamPanelsInputs {
  readonly series: AnalyticsSeries | null;
  readonly locale: string;
  readonly cohort: CohortComparison | null;
  readonly periodKeys: readonly string[];
  readonly activeCohortKey: string;
  readonly onCohortPeriodChange: (value: string) => void;
  readonly freshness: FreshnessCardInputs;
}

export interface TeamPanels {
  readonly chart: SeriesChartView | null;
  readonly cohort: CohortPanelView | null;
  readonly freshness: FreshnessCardView | null;
}

export function buildTeamAnalyticsPanels(
  t: Translate,
  locale: string,
  inputs: TeamPanelsInputs,
): TeamPanels {
  return {
    chart: inputs.series === null ? null : buildSeriesChartView(t, locale, inputs.series),
    cohort:
      inputs.series === null
        ? null
        : buildCohortPanelView(t, {
            cohort: inputs.cohort,
            periodKeys: inputs.periodKeys,
            activeKey: inputs.activeCohortKey,
            onPeriodChange: inputs.onCohortPeriodChange,
          }),
    freshness: buildFreshnessCardView(t, inputs.freshness),
  };
}

/** The screen-level slice: copy, status, controls, panels, and player select. */
export interface TeamAnalyticsScreenDeps {
  readonly context: {
    readonly isOffline: boolean;
    readonly isLoading: boolean;
    readonly canReadTeam: boolean;
  };
  readonly seriesQuery: RemoteQueryView<AnalyticsSeries>;
  readonly controls: AnalyticsControlsView;
  readonly panels: TeamPanels;
  readonly playerOptions: readonly SelectFieldOption[];
  readonly onPlayerSelect: (membershipId: string) => void;
}

export function buildTeamAnalyticsScreenView(
  t: Translate,
  copy: ScreenCopy,
  deps: TeamAnalyticsScreenDeps,
): TeamAnalyticsScreenView {
  return {
    ...copy,
    status: resolveTeamAnalyticsStatus(deps.context, deps.seriesQuery, deps.context.canReadTeam),
    title: t(I18N_KEYS.analytics.title),
    subtitle: t(I18N_KEYS.analytics.subtitle),
    controls: deps.controls,
    chart: deps.panels.chart,
    cohort: deps.panels.cohort,
    freshness: deps.panels.freshness,
    playerSelectLabel: t(I18N_KEYS.analytics.playerSelectLabel),
    playerSelectValue: '',
    playerOptions: deps.playerOptions,
    onPlayerSelect: deps.onPlayerSelect,
  };
}
