import type { ReactNode } from 'react';

export interface VirtualizedListProps<Item> {
  readonly items: readonly Item[];
  readonly renderItem: (item: Item, index: number) => ReactNode;
  readonly heightPx: number;
  readonly emptyTitle: string;
  readonly emptyMessage?: string | undefined;
  /** Rows to render before the list measures itself (server rendering, tests). */
  readonly initialItemCount?: number | undefined;
  readonly testId?: string | undefined;
}
