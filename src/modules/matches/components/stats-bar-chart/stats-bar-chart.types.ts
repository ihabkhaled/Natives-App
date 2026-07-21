import type { ChartTableRow } from '@/shared/ui';

import type { ChartBarView } from '../../types/matches-view.types';

export interface StatsBarChartProps {
  readonly heading: string;
  readonly caption: string;
  readonly toggleLabel: string;
  readonly columns: readonly string[];
  readonly bars: readonly ChartBarView[];
  readonly rows: readonly ChartTableRow[];
}
