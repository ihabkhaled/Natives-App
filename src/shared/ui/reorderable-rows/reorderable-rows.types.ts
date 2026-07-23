import type { ReactNode } from 'react';

/**
 * One reorderable row: prepared content plus its own accessible controls.
 * Labels arrive translated and row-specific ("Move On time up"), so a screen
 * reader user always knows which entry a control acts on.
 */
export interface ReorderableRowView {
  readonly key: string;
  readonly content: ReactNode;
  readonly moveUpLabel: string;
  readonly moveDownLabel: string;
  /** Null when the row must not be removed (archive-not-delete editors). */
  readonly removeLabel: string | null;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onRemove: (() => void) | null;
}

export interface ReorderableRowsProps {
  readonly rows: readonly ReorderableRowView[];
  readonly ariaLabel: string;
  /** Null hides the add control (derived-row editors add nothing). */
  readonly addLabel: string | null;
  readonly onAdd: (() => void) | null;
  readonly addDisabled?: boolean | undefined;
  readonly testId?: string | undefined;
  readonly rowTestId?: string | undefined;
  readonly addTestId?: string | undefined;
}
