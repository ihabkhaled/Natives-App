import type { ReactNode } from 'react';

export interface VirtualizedListProps<Item> {
  readonly items: readonly Item[];
  readonly renderItem: (item: Item, index: number) => ReactNode;
  readonly heightPx: number;
  readonly emptyTitle: string;
  readonly emptyMessage?: string | undefined;
  readonly testId?: string | undefined;
}
