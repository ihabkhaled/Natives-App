import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EMPTY_STATE_DEFAULT_TEST_ID } from '../empty-state/empty-state.constants';
import { VirtualizedList } from './virtual-list.component';

interface Row {
  readonly id: string;
  readonly label: string;
}

const rows: readonly Row[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
];

function renderRow(item: Row): React.JSX.Element {
  return <span>{item.label}</span>;
}

describe('VirtualizedList', () => {
  it('renders an empty state carrying the empty title and message when there are no items', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={renderRow}
        heightPx={300}
        emptyTitle="No rows yet"
        emptyMessage="Add your first row"
        testId="rows-list"
      />,
    );

    expect(screen.getByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No rows yet');
    expect(screen.getByText('Add your first row')).toBeInTheDocument();
    expect(screen.queryByTestId('rows-list')).not.toBeInTheDocument();
  });

  it('renders the empty state without a message when no empty message is provided', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={renderRow}
        heightPx={300}
        emptyTitle="No rows yet"
        testId="rows-list"
      />,
    );

    expect(screen.getByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).toHaveTextContent('No rows yet');
    expect(screen.queryByText('Add your first row')).not.toBeInTheDocument();
  });

  it('renders the virtualized wrapper at the requested height when there are items', () => {
    render(
      <VirtualizedList
        items={rows}
        renderItem={renderRow}
        heightPx={300}
        emptyTitle="No rows yet"
        testId="rows-list"
      />,
    );

    const wrapper = screen.getByTestId('rows-list');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ height: '300px' });
    expect(screen.queryByTestId(EMPTY_STATE_DEFAULT_TEST_ID)).not.toBeInTheDocument();
    expect(screen.getByTestId('virtuoso-scroller')).toBeInTheDocument();
  });
});
