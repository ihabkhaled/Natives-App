import { Virtuoso } from 'react-virtuoso';

import type { AppVirtualListProps } from '../../virtual-list.types';

/**
 * The single owner of react-virtuoso. Feature code renders virtualized
 * lists exclusively through this component or the shared UI wrapper.
 */
export function AppVirtualList<Item>(props: AppVirtualListProps<Item>): React.JSX.Element {
  return (
    <div data-testid={props.testId} style={{ height: props.heightPx }}>
      <Virtuoso
        data={props.items as Item[]}
        overscan={props.overscan ?? 0}
        itemContent={(index, item) => props.renderItem(item, index)}
        style={{ height: '100%' }}
      />
    </div>
  );
}
