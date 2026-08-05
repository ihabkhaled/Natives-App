import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { DrillCardView } from '../../types/drills-view.types';
import { DrillCard } from './drill-card.component';

const ITEM: DrillCardView = {
  id: 'd1',
  name: 'Give-and-go break',
  categoryLabel: 'Throwing',
  intensityLabel: 'Moderate',
  durationLabel: '15 min',
  statusLabel: 'Active',
  statusTone: 'success',
  tagsSummary: 'throwing, footwork',
  ariaLabel: 'Give-and-go break',
};

describe('DrillCard', () => {
  it('renders the name, facts, and status', () => {
    render(<DrillCard item={ITEM} onOpen={vi.fn()} />);

    expect(screen.getByText('Give-and-go break')).toBeInTheDocument();
    expect(screen.getByText(/Throwing.*Moderate.*15 min/)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toBeInTheDocument();
  });

  it('renders an archived drill through the same card, visibly distinguishable', () => {
    render(
      <DrillCard
        item={{ ...ITEM, statusLabel: 'Archived', statusTone: 'medium' }}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toBeInTheDocument();
    expect(screen.getByText('Give-and-go break')).toBeInTheDocument();
  });

  it('opens the drill on click', () => {
    const onOpen = vi.fn();
    render(<DrillCard item={ITEM} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole('button', { name: 'Give-and-go break' }));

    expect(onOpen).toHaveBeenCalledWith('d1');
  });
});
