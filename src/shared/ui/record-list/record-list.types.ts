import type { ReactNode } from 'react';

/** One record row: a label, its resolved value, and optional detail/state. */
export interface RecordListRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  /** Secondary line, or null when the record has nothing more to say. */
  readonly detail?: string | null | undefined;
  /** Ionic colour token for a state chip, or null for no chip. */
  readonly tone?: string | null | undefined;
  /**
   * Controls this row offers, or undefined for a read-only row. Lifecycle
   * screens put their edit and transition buttons here rather than growing a
   * second, near-identical list component.
   */
  readonly actions?: ReactNode | undefined;
  /** Hide the value line when the state chip already carries it. */
  readonly hideValue?: boolean | undefined;
}

export interface RecordListProps {
  readonly rows: readonly RecordListRow[];
  readonly ariaLabel: string;
  readonly rowTestId?: string;
  readonly testId?: string;
}
