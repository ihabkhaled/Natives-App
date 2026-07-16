import { AppVirtualList } from '@/packages/virtual-list';

import { EmptyState } from '../empty-state';
import type { VirtualizedListProps } from './virtual-list.types';

/** Virtualized list with an integrated empty state. */
export function VirtualizedList<Item>(props: VirtualizedListProps<Item>): React.JSX.Element {
  return props.items.length === 0 ? (
    <EmptyState title={props.emptyTitle} message={props.emptyMessage} />
  ) : (
    <AppVirtualList
      items={props.items}
      renderItem={props.renderItem}
      heightPx={props.heightPx}
      testId={props.testId}
    />
  );
}
