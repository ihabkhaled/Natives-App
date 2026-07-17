import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { AppVirtualListProps } from '@/packages/virtual-list';
import { TEST_IDS } from '@/shared/config';

import { buildWorkbenchItems, type WorkbenchItem } from '../../helpers/workbench-items.helper';
import { WorkbenchList } from './workbench-list.component';
import { WORKBENCH_LIST_HEIGHT_PX, WORKBENCH_LIST_TEST_IDS } from './workbench-list.constants';

/**
 * react-virtuoso measures itself before rendering rows, and jsdom reports a
 * zero-height viewport, so the real list never calls renderItem here. Stub
 * the virtualization owner to render every row eagerly; the shared
 * VirtualizedList (and its empty-state branch) stays real.
 */
vi.mock('@/packages/virtual-list', async () => {
  const { createElement, Fragment } = await import('react');
  return {
    AppVirtualList: (props: AppVirtualListProps<WorkbenchItem>) =>
      createElement(
        'div',
        { 'data-testid': props.testId, style: { height: props.heightPx } },
        props.items.map((item, index) =>
          createElement(Fragment, { key: item.id }, props.renderItem(item, index)),
        ),
      ),
  };
});

const ITEMS: readonly WorkbenchItem[] = buildWorkbenchItems(3, (index) => `Item ${String(index)}`);

function renderList(items: readonly WorkbenchItem[]): void {
  render(<WorkbenchList heading="Virtualized list" items={items} emptyTitle="Nothing here yet" />);
}

describe('WorkbenchList', () => {
  it('renders the section heading', () => {
    renderList(ITEMS);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Virtualized list');
  });

  it('renders the virtualized list wrapper when there are items', () => {
    renderList(ITEMS);

    expect(screen.getByTestId(WORKBENCH_LIST_TEST_IDS.list)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.emptyState)).not.toBeInTheDocument();
  });

  it('constrains the list to a fixed viewport so it can virtualize', () => {
    renderList(ITEMS);

    expect(screen.getByTestId(WORKBENCH_LIST_TEST_IDS.list)).toHaveStyle({
      height: `${String(WORKBENCH_LIST_HEIGHT_PX)}px`,
    });
  });

  it('renders one row per item', () => {
    renderList(ITEMS);

    expect(screen.getAllByTestId(WORKBENCH_LIST_TEST_IDS.item)).toHaveLength(3);
  });

  it('labels each row from its item', () => {
    renderList(ITEMS);

    expect(
      screen.getAllByTestId(WORKBENCH_LIST_TEST_IDS.item).map((row) => row.textContent),
    ).toEqual(['Item 0', 'Item 1', 'Item 2']);
  });

  it('falls back to the empty state when there are no items', () => {
    renderList([]);

    expect(screen.getByTestId(TEST_IDS.emptyState)).toHaveTextContent('Nothing here yet');
    expect(screen.queryByTestId(WORKBENCH_LIST_TEST_IDS.list)).not.toBeInTheDocument();
    expect(screen.queryByTestId(WORKBENCH_LIST_TEST_IDS.item)).not.toBeInTheDocument();
  });
});
