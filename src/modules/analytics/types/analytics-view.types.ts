import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** One dot of the rendered line. */
export interface SeriesChartMarker {
  readonly key: string;
  readonly x: number;
  readonly y: number;
}

/** One sparse x-axis label. */
export interface SeriesChartTick {
  readonly key: string;
  readonly x: number;
  readonly label: string;
}

/** Everything the SVG needs, prepared by the pure geometry helper. */
export interface SeriesChartGeometry {
  readonly linePath: string;
  readonly markers: readonly SeriesChartMarker[];
  readonly ticks: readonly SeriesChartTick[];
  readonly hasGap: boolean;
}

/** One row of the chart's accessible tabular twin. */
export interface SeriesTableRow {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
}

/** The rendered series card: geometry, citations, and the data table. */
export interface SeriesChartView {
  readonly title: string;
  readonly description: string;
  readonly geometry: SeriesChartGeometry;
  readonly unitLabel: string;
  readonly directionLegend: string;
  readonly gapNotice: string | null;
  readonly summary: string;
  readonly benchmark: string;
  readonly calculationVersion: string;
  readonly computedAt: string;
  readonly tableCaption: string;
  readonly tableToggleLabel: string;
  readonly tableColumnLabels: readonly string[];
  readonly tableRows: readonly SeriesTableRow[];
}

/** One stat tile of the cohort panel. */
export interface CohortTileView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

/** The cohort panel: tiles when open, the privacy notice when suppressed. */
export interface CohortPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly periodLabel: string;
  readonly periodValue: string;
  readonly periodOptions: readonly SelectFieldOption[];
  readonly onPeriodChange: (value: string) => void;
  readonly tiles: readonly CohortTileView[];
  readonly sampleLabel: string | null;
  readonly suppressedTitle: string | null;
  readonly suppressedMessage: string | null;
  readonly emptyLabel: string | null;
}

/** The rebuild confirm dialog, present only while open. */
export interface RebuildDialogView {
  readonly heading: string;
  readonly intro: string;
  readonly periodLabel: string;
  readonly periodValue: string;
  readonly periodOptions: readonly SelectFieldOption[];
  readonly onPeriodChange: (value: string) => void;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly canConfirm: boolean;
  readonly isRunning: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** The freshness card; the rebuild affordance exists only for its holders. */
export interface FreshnessCardView {
  readonly heading: string;
  readonly statusLabel: string;
  readonly isStale: boolean;
  readonly staleBadgeLabel: string | null;
  readonly rebuildLabel: string | null;
  readonly onOpenRebuild: () => void;
  readonly rebuildDisabledReason: string | null;
  readonly dialog: RebuildDialogView | null;
  readonly reportBanner: string | null;
}

/** The shared control bar of both analytics screens. */
export interface AnalyticsControlsView {
  readonly dimensionLabel: string;
  readonly dimensionValue: string;
  readonly dimensionGroups: readonly {
    readonly key: string;
    readonly label: string;
    readonly options: readonly SelectFieldOption[];
  }[];
  readonly onDimensionChange: (value: string) => void;
  readonly periodLabel: string;
  readonly periodValue: string;
  readonly periodOptions: readonly SelectFieldOption[];
  readonly onPeriodChange: (value: string) => void;
}

/** The team analytics screen, ready to render. */
export interface TeamAnalyticsScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly controls: AnalyticsControlsView;
  readonly chart: SeriesChartView | null;
  readonly cohort: CohortPanelView | null;
  readonly freshness: FreshnessCardView | null;
  readonly playerSelectLabel: string;
  readonly playerSelectValue: string;
  readonly playerOptions: readonly SelectFieldOption[];
  readonly onPlayerSelect: (membershipId: string) => void;
}

/** The player analytics screen, ready to render. */
export interface PlayerAnalyticsScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly identityLabel: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly controls: AnalyticsControlsView;
  readonly chart: SeriesChartView | null;
  readonly notFoundTitle: string;
  readonly notFoundMessage: string;
  readonly isScopeMissing: boolean;
}
