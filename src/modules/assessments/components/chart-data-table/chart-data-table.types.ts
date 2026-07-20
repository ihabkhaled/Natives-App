import type { ChartTableRow } from '../../types/assessments-view.types';

export interface ChartDataTableProps {
  readonly caption: string;
  readonly toggleLabel: string;
  readonly columnLabels: readonly string[];
  readonly rows: readonly ChartTableRow[];
}
