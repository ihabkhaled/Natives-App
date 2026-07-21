/** One record row: a label, its resolved value, and optional detail/state. */
export interface RecordListRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  /** Secondary line, or null when the record has nothing more to say. */
  readonly detail?: string | null;
  /** Ionic colour token for a state chip, or null for no chip. */
  readonly tone?: string | null;
}

export interface RecordListProps {
  readonly rows: readonly RecordListRow[];
  readonly ariaLabel: string;
  readonly rowTestId?: string;
  readonly testId?: string;
}
