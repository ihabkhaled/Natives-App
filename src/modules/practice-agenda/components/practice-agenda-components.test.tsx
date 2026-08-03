import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAgendaBlockRowView,
  buildAgendaStationRowView,
} from '../../../../tests/factories/practice-agenda-view.factory';
import { AgendaBlockList } from './agenda-block-list';
import { AgendaBlockRow } from './agenda-block-row';

const LIST_LABELS = {
  ariaLabel: 'Blocks',
  moveUpLabel: 'Move up',
  moveDownLabel: 'Move down',
  removeStationLabel: 'Remove',
};

describe('AgendaBlockRow', () => {
  it('names the block in the coach’s own words, with its duration', () => {
    render(
      <AgendaBlockRow
        view={buildAgendaBlockRowView({ title: 'Cutting drill', durationLabel: '30 min' })}
        removeStationLabel="Remove"
        canEdit
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Cutting drill' })).toBeInTheDocument();
    // The shared chip prints the label twice: once for assistive tech, once visually.
    expect(screen.getAllByText('30 min')).toHaveLength(2);
  });

  it('shows no duration at all for an untimed block', () => {
    render(
      <AgendaBlockRow
        view={buildAgendaBlockRowView({ durationLabel: null, notes: null })}
        removeStationLabel="Remove"
        canEdit
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.queryByText('15 min')).not.toBeInTheDocument();
  });

  it('lists the stations with their targets', () => {
    render(
      <AgendaBlockRow
        view={buildAgendaBlockRowView({
          notes: 'Rotate every eight minutes.',
          stations: [
            buildAgendaStationRowView({ name: 'Under cuts', detail: 'Sharp change of pace' }),
          ],
        })}
        removeStationLabel="Remove"
        canEdit
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.getByText('Rotate every eight minutes.')).toBeInTheDocument();
    expect(screen.getByText('Under cuts')).toBeInTheDocument();
    expect(screen.getByText('Sharp change of pace')).toBeInTheDocument();
  });

  it('reports the station and its block when a coach drops one', () => {
    const onRemoveStation = vi.fn();
    render(
      <AgendaBlockRow
        view={buildAgendaBlockRowView({
          stations: [buildAgendaStationRowView({ id: 'st1', blockId: 'b1' })],
        })}
        removeStationLabel="Remove"
        canEdit
        onRemoveStation={onRemoveStation}
      />,
    );

    fireEvent.click(screen.getByTestId(`${TEST_IDS.practiceAgendaAction}-st1`));

    expect(onRemoveStation).toHaveBeenCalledWith('b1', 'st1');
  });

  it('hides the remove control from a reader rather than showing it disabled', () => {
    render(
      <AgendaBlockRow
        view={buildAgendaBlockRowView({ stations: [buildAgendaStationRowView({ id: 'st1' })] })}
        removeStationLabel="Remove"
        canEdit={false}
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.queryByTestId(`${TEST_IDS.practiceAgendaAction}-st1`)).not.toBeInTheDocument();
  });
});

describe('AgendaBlockList', () => {
  const blocks = [
    buildAgendaBlockRowView({ id: 'b1', title: 'Warm-up' }),
    buildAgendaBlockRowView({ id: 'b2', title: 'Drill' }),
  ];

  it('draws one row per block, in the order it was given', () => {
    render(
      <AgendaBlockList
        blocks={blocks}
        {...LIST_LABELS}
        canEdit
        isSaving={false}
        onMoveBlock={vi.fn()}
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.practiceAgendaRow)).toHaveLength(2);
  });

  it('moves a block by its own index', () => {
    const onMoveBlock = vi.fn();
    render(
      <AgendaBlockList
        blocks={blocks}
        {...LIST_LABELS}
        canEdit
        isSaving={false}
        onMoveBlock={onMoveBlock}
        onRemoveStation={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[1]!);
    fireEvent.click(screen.getAllByRole('button', { name: 'Move down' })[0]!);

    expect(onMoveBlock).toHaveBeenNthCalledWith(1, 1, -1);
    expect(onMoveBlock).toHaveBeenNthCalledWith(2, 0, 1);
  });

  it('pins the ends of the plan: nothing moves above the first or below the last', () => {
    render(
      <AgendaBlockList
        blocks={blocks}
        {...LIST_LABELS}
        canEdit
        isSaving={false}
        onMoveBlock={vi.fn()}
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: 'Move up' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Move down' })[1]).toBeDisabled();
  });

  it('goes quiet while a move is in flight, so a second one cannot race it', () => {
    render(
      <AgendaBlockList
        blocks={blocks}
        {...LIST_LABELS}
        canEdit
        isSaving
        onMoveBlock={vi.fn()}
        onRemoveStation={vi.fn()}
      />,
    );

    // A second move would carry the version the first is about to spend.
    expect(screen.getAllByRole('button', { name: 'Move up' })[1]).toBeDisabled();
  });

  it('leaves a reader with no way to rearrange the plan', () => {
    render(
      <AgendaBlockList
        blocks={blocks}
        {...LIST_LABELS}
        canEdit={false}
        isSaving={false}
        onMoveBlock={vi.fn()}
        onRemoveStation={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: 'Move up' })[1]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Move down' })[0]).toBeDisabled();
  });
});
