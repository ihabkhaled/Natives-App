import { CHART_GEOMETRY } from '../constants/assessments.constants';
import type {
  ChartAxisTick,
  ChartMarker,
  ChartPoint,
  TrendChartView,
} from '../types/assessments-view.types';

/**
 * In-house SVG geometry. No chart vendor is introduced: the module owns a few
 * pure functions that turn values into path data, and every gap (`null`) stays
 * a gap — the line breaks instead of dropping to the baseline.
 */
const PLOT_WIDTH = CHART_GEOMETRY.width - CHART_GEOMETRY.paddingX * 2;
const PLOT_HEIGHT = CHART_GEOMETRY.height - CHART_GEOMETRY.paddingY * 2;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Horizontal position of point `index` of `count`. */
export function pointX(index: number, count: number): number {
  if (count <= 1) {
    return round(CHART_GEOMETRY.paddingX + PLOT_WIDTH / 2);
  }
  return round(CHART_GEOMETRY.paddingX + (PLOT_WIDTH * index) / (count - 1));
}

/** Vertical position of a value within `[minimum, maximum]`, y-flipped. */
export function pointY(value: number, minimum: number, maximum: number): number {
  const span = maximum - minimum;
  const ratio = span === 0 ? 0.5 : (value - minimum) / span;
  const clamped = Math.min(1, Math.max(0, ratio));
  return round(CHART_GEOMETRY.paddingY + PLOT_HEIGHT * (1 - clamped));
}

/**
 * Build the polyline path. Consecutive evaluated points connect; a `null`
 * starts a new sub-path so an unevaluated period reads as a break, never a dip
 * to zero.
 */
export function buildLinePath(
  points: readonly ChartPoint[],
  minimum: number,
  maximum: number,
): string {
  const segments: string[] = [];
  let open = false;
  points.forEach((point, index) => {
    if (point.value === null) {
      open = false;
      return;
    }
    const x = pointX(index, points.length);
    const y = pointY(point.value, minimum, maximum);
    segments.push(`${open ? 'L' : 'M'}${x} ${y}`);
    open = true;
  });
  return segments.join(' ');
}

/** Closed area under the longest evaluated run, for the soft lime wash. */
export function buildAreaPath(
  points: readonly ChartPoint[],
  minimum: number,
  maximum: number,
): string {
  const evaluated = points.flatMap((point, index) =>
    point.value === null ? [] : [{ value: point.value, index }],
  );
  const first = evaluated[0];
  const last = evaluated.at(-1);
  if (first === undefined || last === undefined || evaluated.length < 2) {
    return '';
  }
  const baseline = CHART_GEOMETRY.height - CHART_GEOMETRY.paddingY;
  const body = evaluated
    .map(
      (entry, position) =>
        `${position === 0 ? 'M' : 'L'}${pointX(entry.index, points.length)} ${pointY(
          entry.value,
          minimum,
          maximum,
        )}`,
    )
    .join(' ');
  return `${body} L${pointX(last.index, points.length)} ${baseline} L${pointX(
    first.index,
    points.length,
  )} ${baseline} Z`;
}

/** One marker per evaluated point; gaps produce no marker at all. */
export function buildMarkers(
  points: readonly ChartPoint[],
  minimum: number,
  maximum: number,
): readonly ChartMarker[] {
  return points.flatMap((point, index) =>
    point.value === null
      ? []
      : [
          {
            key: `${point.label}-${String(index)}`,
            x: pointX(index, points.length),
            y: pointY(point.value, minimum, maximum),
          },
        ],
  );
}

/** Category labels along the x axis. */
export function buildAxisTicks(points: readonly ChartPoint[]): readonly ChartAxisTick[] {
  return points.map((point, index) => ({
    key: `${point.label}-${String(index)}`,
    x: pointX(index, points.length),
    y: CHART_GEOMETRY.height - 4,
    label: point.label,
  }));
}

/** The four geometry facts every trend chart derives from one series. */
export function buildTrendGeometry(
  points: readonly ChartPoint[],
  minimum: number,
  maximum: number,
): Pick<TrendChartView, 'linePath' | 'areaPath' | 'markers' | 'axisTicks'> {
  return {
    linePath: buildLinePath(points, minimum, maximum),
    areaPath: buildAreaPath(points, minimum, maximum),
    markers: buildMarkers(points, minimum, maximum),
    axisTicks: buildAxisTicks(points),
  };
}

/** Nice bounds for a series; a flat series still gets a readable band. */
export function resolveBounds(
  points: readonly ChartPoint[],
  fallbackMaximum: number,
): { minimum: number; maximum: number } {
  const values = points.flatMap((point) => (point.value === null ? [] : [point.value]));
  if (values.length === 0) {
    return { minimum: 0, maximum: fallbackMaximum };
  }
  const lowest = Math.min(0, ...values);
  const highest = Math.max(fallbackMaximum, ...values);
  return { minimum: lowest, maximum: highest === lowest ? lowest + 1 : highest };
}

/** Polar coordinate on the radar for axis `index` of `count`. */
export function radarPoint(index: number, count: number, ratio: number): { x: number; y: number } {
  const center = CHART_GEOMETRY.radarSize / 2;
  const radius = center - 36;
  const angle = (Math.PI * 2 * index) / Math.max(1, count) - Math.PI / 2;
  const clamped = Math.min(1, Math.max(0, ratio));
  return {
    x: round(center + Math.cos(angle) * radius * clamped),
    y: round(center + Math.sin(angle) * radius * clamped),
  };
}

/** Evenly spaced guide rings from the centre outwards. */
export function radarRingRadii(): readonly number[] {
  const center = CHART_GEOMETRY.radarSize / 2;
  const radius = center - 36;
  return Array.from({ length: CHART_GEOMETRY.radarRings }, (_unused, index) =>
    round((radius * (index + 1)) / CHART_GEOMETRY.radarRings),
  );
}
