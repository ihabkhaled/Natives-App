import { ANALYTICS_CHART_GEOMETRY } from '../constants/analytics.constants';
import type { AnalyticsSeriesPoint } from '../types/analytics.types';
import type {
  SeriesChartGeometry,
  SeriesChartMarker,
  SeriesChartTick,
} from '../types/analytics-view.types';

/**
 * In-house SVG geometry for the analytics line. No chart vendor: a handful of
 * pure functions turn a governed series into path data. A null value is an
 * evaluated gap — the line breaks into a new sub-path and no marker is drawn,
 * so a gap can never read as a drop to zero.
 */
const CANVAS = ANALYTICS_CHART_GEOMETRY;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Vertical bounds padded by a tenth of the span so the line never kisses the
 * frame; a flat or empty series still gets a readable one-unit band.
 */
export function resolveSeriesBounds(points: readonly AnalyticsSeriesPoint[]): {
  readonly lowest: number;
  readonly highest: number;
} {
  const values = points.flatMap((point) => (point.value === null ? [] : [point.value]));
  if (values.length === 0) {
    return { lowest: 0, highest: 1 };
  }
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) {
    return { lowest: minimum - 0.5, highest: maximum + 0.5 };
  }
  const pad = (maximum - minimum) / 10;
  return { lowest: minimum - pad, highest: maximum + pad };
}

interface ScaledPoint {
  readonly key: string;
  readonly periodKey: string;
  readonly x: number;
  readonly y: number | null;
}

/** Even horizontal spacing; y scaled into the padded plot band, y-flipped. */
export function scaleSeriesPoints(points: readonly AnalyticsSeriesPoint[]): readonly ScaledPoint[] {
  const bounds = resolveSeriesBounds(points);
  const span = bounds.highest - bounds.lowest;
  const plotWidth = CANVAS.width - CANVAS.paddingX * 2;
  const plotHeight = CANVAS.height - CANVAS.paddingY * 2;
  const step = points.length <= 1 ? 0 : plotWidth / (points.length - 1);
  return points.map((point, index) => ({
    key: `${point.periodKey}-${String(index)}`,
    periodKey: point.periodKey,
    x: round2(points.length <= 1 ? CANVAS.width / 2 : CANVAS.paddingX + step * index),
    y:
      point.value === null
        ? null
        : round2(CANVAS.paddingY + plotHeight * (1 - (point.value - bounds.lowest) / span)),
  }));
}

/** Sub-paths joined; each null starts a fresh `M` so gaps stay gaps. */
export function buildSeriesLinePath(scaled: readonly ScaledPoint[]): string {
  let path = '';
  let pen = false;
  for (const point of scaled) {
    if (point.y === null) {
      pen = false;
      continue;
    }
    path += `${pen ? ' L' : `${path === '' ? '' : ' '}M`}${String(point.x)} ${String(point.y)}`;
    pen = true;
  }
  return path;
}

/** One marker per evaluated point; gaps produce none. */
export function buildSeriesMarkers(scaled: readonly ScaledPoint[]): readonly SeriesChartMarker[] {
  return scaled.flatMap((point) =>
    point.y === null ? [] : [{ key: point.key, x: point.x, y: point.y }],
  );
}

/**
 * Sparse x-axis ticks: at most `maxTicks` labels, always including the first
 * and last period so a 30-point monthly series stays legible on a phone.
 */
function buildSeriesTicks(scaled: readonly ScaledPoint[]): readonly SeriesChartTick[] {
  if (scaled.length <= CANVAS.maxTicks) {
    return scaled.map((point) => ({ key: point.key, x: point.x, label: point.periodKey }));
  }
  const stride = Math.ceil((scaled.length - 1) / (CANVAS.maxTicks - 1));
  return scaled.flatMap((point, index) => {
    const isEdge = index === 0 || index === scaled.length - 1;
    if (!isEdge && index % stride !== 0) {
      return [];
    }
    return [{ key: point.key, x: point.x, label: point.periodKey }];
  });
}

/** The complete geometry one series chart renders from. */
export function buildSeriesChartGeometry(
  points: readonly AnalyticsSeriesPoint[],
): SeriesChartGeometry {
  const scaled = scaleSeriesPoints(points);
  return {
    linePath: buildSeriesLinePath(scaled),
    markers: buildSeriesMarkers(scaled),
    ticks: buildSeriesTicks(scaled),
    hasGap: points.some((point) => point.value === null),
  };
}
