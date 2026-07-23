import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildBuddySectionView } from '../../../../../tests/factories/training-view.factory';
import { BuddyCreditList } from './buddy-credit-list.component';

describe('BuddyCreditList', () => {
  it('offers confirm and decline for a pending credit and forwards each', () => {
    const view = buildBuddySectionView();
    render(<BuddyCreditList view={view} />);

    expect(screen.getByText('1 pending')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingBuddyConfirm));
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingBuddyDecline));

    expect(view.onConfirm).toHaveBeenCalledWith('buddy-1');
    expect(view.onDecline).toHaveBeenCalledWith('buddy-1');
  });

  it('shows the answered chip instead of buttons once responded', () => {
    render(
      <BuddyCreditList
        view={buildBuddySectionView({
          countBadge: null,
          items: [
            {
              id: 'buddy-2',
              claimLabel: 'Claim 000004',
              dateLabel: '10 Jul 2026',
              statusLabel: 'Confirmed',
              statusTone: 'success',
              respondedLabel: 'Responded 11 Jul 2026',
              isPending: false,
              isConfirming: false,
              isDeclining: false,
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
    expect(screen.getByText('Responded 11 Jul 2026')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.trainingBuddyConfirm)).not.toBeInTheDocument();
  });

  it('renders the honest empty line, loading shell, and failure line', () => {
    const { unmount } = render(
      <BuddyCreditList view={buildBuddySectionView({ items: [], countBadge: null })} />,
    );
    expect(screen.getByText('No pending buddy credits.')).toBeInTheDocument();
    unmount();

    const utils = render(
      <BuddyCreditList
        view={buildBuddySectionView({ items: [], countBadge: null, isLoading: true })}
      />,
    );
    expect(screen.queryByText('No pending buddy credits.')).not.toBeInTheDocument();
    utils.unmount();

    render(
      <BuddyCreditList
        view={buildBuddySectionView({
          items: [],
          countBadge: null,
          unavailableMessage: 'Could not load.',
        })}
      />,
    );
    expect(screen.getByText('Could not load.')).toBeInTheDocument();
  });
});
