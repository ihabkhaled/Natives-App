import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReorderableRows } from './reorderable-rows.component';
import type { ReorderableRowView } from './reorderable-rows.types';

function makeRow(overrides: Partial<ReorderableRowView>): ReorderableRowView {
  return {
    key: 'row-1',
    content: <span>Row one</span>,
    moveUpLabel: 'Move up',
    moveDownLabel: 'Move down',
    removeLabel: 'Remove',
    canMoveUp: false,
    canMoveDown: true,
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
}

describe('ReorderableRows', () => {
  it('renders an ordered list with per-row accessible controls', async () => {
    const onMoveDown = vi.fn();
    render(
      <ReorderableRows
        rows={[makeRow({ onMoveDown })]}
        ariaLabel="Statuses"
        addLabel="Add status"
        onAdd={vi.fn()}
        testId="rows"
        rowTestId="row"
        addTestId="add"
      />,
    );

    expect(screen.getByRole('list', { name: 'Statuses' })).toBeInTheDocument();
    expect(screen.getByLabelText('Move up')).toBeDisabled();
    await userEvent.click(screen.getByLabelText('Move down'));
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it('invokes removal and addition through their labelled controls', async () => {
    const onRemove = vi.fn();
    const onAdd = vi.fn();
    render(
      <ReorderableRows
        rows={[makeRow({ onRemove })]}
        ariaLabel="Tiers"
        addLabel="Add tier"
        onAdd={onAdd}
        addTestId="add"
      />,
    );

    await userEvent.click(screen.getByLabelText('Remove'));
    await userEvent.click(screen.getByTestId('add'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('hides removal and the add control when a list is closed', () => {
    render(
      <ReorderableRows
        rows={[makeRow({ removeLabel: null, onRemove: null })]}
        ariaLabel="Statuses"
        addLabel={null}
        onAdd={null}
      />,
    );

    expect(screen.queryByLabelText('Remove')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add status' })).not.toBeInTheDocument();
  });
});
