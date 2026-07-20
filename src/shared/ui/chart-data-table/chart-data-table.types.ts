/** One row of the tabular alternative: a labelled header cell plus its value. */
export interface ChartTableRow {
  readonly key: string;
  readonly label: string;
  /** Already-formatted value, including the honest "not evaluated" wording. */
  readonly valueText: string;
}

export interface ChartDataTableProps {
  readonly caption: string;
  readonly toggleLabel: string;
  readonly columnLabels: readonly string[];
  readonly rows: readonly ChartTableRow[];
}
