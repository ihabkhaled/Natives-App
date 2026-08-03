import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildJerseyDetailView,
  buildJerseyOrderRowView,
  buildJerseyScreenView,
} from '../../../../../tests/factories/jersey-view.factory';
import { JerseyView } from './jersey-view.component';

describe('JerseyView', () => {
  it('lists the orders with their count and ordering promise once ready', () => {
    render(<JerseyView {...buildJerseyScreenView()} />);

    expect(screen.getByText(/3 orders/u)).toBeInTheDocument();
    expect(screen.getByText(/Newest first\./u)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.jerseyRow}-order-1`)).toBeInTheDocument();
  });

  it('renders no list while the screen is not ready', () => {
    render(<JerseyView {...buildJerseyScreenView({ status: 'empty', rows: [] })} />);

    expect(screen.queryByText(/3 orders/u)).not.toBeInTheDocument();
    expect(screen.getByText('No jersey orders yet')).toBeInTheDocument();
  });

  it('announces a failed order read as a status message', () => {
    render(<JerseyView {...buildJerseyScreenView({ notice: 'That action did not complete.' })} />);

    expect(screen.getByRole('status')).toHaveTextContent('That action did not complete.');
  });

  it('reports the order an operator chose to its caller', () => {
    const onToggleOrder = vi.fn();
    render(<JerseyView {...buildJerseyScreenView({ onToggleOrder })} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.jerseyAction}-order-1`));

    expect(onToggleOrder).toHaveBeenCalledWith('order-1');
  });

  it('attaches the packing list to the row it belongs to, and no other', () => {
    render(
      <JerseyView
        {...buildJerseyScreenView({
          rows: [
            buildJerseyOrderRowView({ id: 'order-1', isOpen: true }),
            buildJerseyOrderRowView({ id: 'order-2', reference: 'UN-2026-TRAINING' }),
          ],
          detail: buildJerseyDetailView({ orderId: 'order-1' }),
        })}
      />,
    );

    expect(screen.getByTestId(`${TEST_IDS.jerseyRow}-order-1-lines`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${TEST_IDS.jerseyRow}-order-2-lines`)).not.toBeInTheDocument();
  });
});
