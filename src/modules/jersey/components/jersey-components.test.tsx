import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildJerseyDetailView,
  buildJerseyOrderLineView,
  buildJerseyOrderRowView,
} from '../../../../tests/factories/jersey-view.factory';
import { JerseyOrderLines } from './jersey-order-lines';
import { JerseyOrderRow } from './jersey-order-row';
import { JerseyOrderSummary } from './jersey-order-summary';

describe('JerseyOrderSummary', () => {
  it('names the order, its supplier and when it was raised', () => {
    render(<JerseyOrderSummary view={buildJerseyOrderRowView()} />);

    expect(screen.getByText('UN-2026-HOME')).toBeInTheDocument();
    expect(screen.getByText('Kitmaker Cairo')).toBeInTheDocument();
    expect(screen.getByText('1 August 2026')).toBeInTheDocument();
  });

  it('omits the supplier line entirely when there is none', () => {
    render(<JerseyOrderSummary view={buildJerseyOrderRowView({ supplier: null })} />);

    expect(screen.queryByText('Kitmaker Cairo')).not.toBeInTheDocument();
  });

  it('hands the state chip over to the panel once the order is open', () => {
    // Two chips disagreeing about one order would be worse than one.
    const { rerender } = render(<JerseyOrderSummary view={buildJerseyOrderRowView()} />);
    expect(screen.getAllByText('ordered').length).toBeGreaterThan(0);

    rerender(<JerseyOrderSummary view={buildJerseyOrderRowView({ isOpen: true })} />);
    expect(screen.queryByText('ordered')).not.toBeInTheDocument();
  });
});

describe('JerseyOrderRow', () => {
  it('reports the order an operator opened', () => {
    const onToggle = vi.fn();
    render(<JerseyOrderRow view={buildJerseyOrderRowView()} detail={null} onToggle={onToggle} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.jerseyAction}-order-1`));

    expect(onToggle).toHaveBeenCalledWith('order-1');
  });

  it('offers no control at all without the manage grant', () => {
    // Inert rather than disabled: a control that refuses on click teaches
    // an operator nothing about why.
    render(
      <JerseyOrderRow
        view={buildJerseyOrderRowView({ canOpen: false })}
        detail={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('UN-2026-HOME')).toBeInTheDocument();
  });

  it('marks the toggle as expanded while the order is open', () => {
    render(
      <JerseyOrderRow
        view={buildJerseyOrderRowView({ isOpen: true })}
        detail={buildJerseyDetailView()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId(`${TEST_IDS.jerseyRow}-order-1-lines`)).toBeInTheDocument();
  });
});

describe('JerseyOrderLines', () => {
  it('waits with a labelled spinner until the packing list lands', () => {
    render(<JerseyOrderLines view={buildJerseyDetailView({ isLoading: true })} />);

    expect(screen.getByTestId(`${TEST_IDS.jerseyLoading}-order-1`)).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('lists the garment, its quantity and the name being printed on it', () => {
    render(<JerseyOrderLines view={buildJerseyDetailView()} />);

    expect(screen.getByText('Home jersey 2026')).toBeInTheDocument();
    expect(screen.getByText('×1')).toBeInTheDocument();
    expect(screen.getByText('#7 · ADEL')).toBeInTheDocument();
  });

  it('shows nothing personal for a plain stock line', () => {
    render(
      <JerseyOrderLines
        view={buildJerseyDetailView({
          lines: [buildJerseyOrderLineView({ personalization: null })],
        })}
      />,
    );

    expect(screen.queryByText('#7 · ADEL')).not.toBeInTheDocument();
    expect(screen.getByText('Home jersey 2026')).toBeInTheDocument();
  });

  it('labels the panel with the order it belongs to', () => {
    render(<JerseyOrderLines view={buildJerseyDetailView()} />);

    expect(screen.getByRole('region', { name: 'UN-2026-HOME' })).toBeInTheDocument();
  });
});
