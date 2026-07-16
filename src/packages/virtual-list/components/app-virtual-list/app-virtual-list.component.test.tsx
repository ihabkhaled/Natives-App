import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AppVirtualList } from './app-virtual-list.component';

interface Row {
  readonly id: string;
  readonly label: string;
}

const ROWS: readonly Row[] = [
  { id: 'r-1', label: 'First row' },
  { id: 'r-2', label: 'Second row' },
  { id: 'r-3', label: 'Third row' },
];

beforeAll(() => {
  // jsdom has no layout engine; react-virtuoso observes element sizes on mount.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      public observe(): void {
        return undefined;
      }
      public unobserve(): void {
        return undefined;
      }
      public disconnect(): void {
        return undefined;
      }
    },
  );
});

describe('AppVirtualList', () => {
  it('renders the initial window of items through renderItem', () => {
    const renderItem = vi.fn((item: Row, index: number) => (
      <span data-testid={`row-${item.id}`}>{`${String(index)}: ${item.label}`}</span>
    ));

    render(
      <AppVirtualList
        items={ROWS}
        renderItem={renderItem}
        heightPx={300}
        initialItemCount={3}
        testId="rows"
      />,
    );

    expect(screen.getByTestId('row-r-1')).toHaveTextContent('0: First row');
    expect(screen.getByTestId('row-r-2')).toHaveTextContent('1: Second row');
    expect(screen.getByTestId('row-r-3')).toHaveTextContent('2: Third row');
    expect(renderItem).toHaveBeenCalledWith(ROWS[0], 0);
    expect(renderItem).toHaveBeenCalledWith(ROWS[1], 1);
    expect(renderItem).toHaveBeenCalledWith(ROWS[2], 2);
  });

  it('applies the requested height to the test-id wrapper', () => {
    render(
      <AppVirtualList
        items={ROWS}
        renderItem={(item: Row) => <span>{item.label}</span>}
        heightPx={420}
        initialItemCount={1}
        testId="rows"
      />,
    );

    expect(screen.getByTestId('rows')).toHaveStyle({ height: '420px' });
  });

  it('renders nothing from the list when there are no items', () => {
    const renderItem = vi.fn((item: Row) => <span>{item.label}</span>);

    render(<AppVirtualList items={[]} renderItem={renderItem} heightPx={120} testId="rows" />);

    expect(screen.getByTestId('rows')).toBeInTheDocument();
    expect(renderItem).not.toHaveBeenCalled();
  });

  it('renders without a test id or an overscan override', () => {
    render(
      <AppVirtualList
        items={ROWS}
        renderItem={(item: Row) => <span>{item.label}</span>}
        heightPx={200}
        initialItemCount={1}
      />,
    );

    expect(screen.queryByTestId('rows')).not.toBeInTheDocument();
    expect(screen.getByText('First row')).toBeInTheDocument();
  });

  it('accepts an explicit overscan', () => {
    render(
      <AppVirtualList
        items={ROWS}
        renderItem={(item: Row) => <span>{item.label}</span>}
        heightPx={200}
        overscan={200}
        initialItemCount={2}
        testId="rows"
      />,
    );

    expect(screen.getByText('Second row')).toBeInTheDocument();
  });
});
