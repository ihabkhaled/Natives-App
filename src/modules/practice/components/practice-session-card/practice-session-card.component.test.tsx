import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionCardView } from '../../../../../tests/factories/practice-view.factory';
import { PracticeSessionCard } from './practice-session-card.component';

describe('PracticeSessionCard', () => {
  it('shows the time, title, venue, and RSVP status', () => {
    render(<PracticeSessionCard card={buildPracticeSessionCardView()} onSelect={vi.fn()} />);

    const card = screen.getByTestId(TEST_IDS.practiceSessionCard);
    expect(card).toHaveTextContent('5:00 PM');
    expect(card).toHaveTextContent('Evening practice');
    expect(card).toHaveTextContent('Zamalek Club Field');
    expect(card).toHaveTextContent('No response yet');
  });

  it('surfaces change, status, and waitlist badges', () => {
    render(
      <PracticeSessionCard
        card={buildPracticeSessionCardView({
          showStatusBadge: true,
          statusLabel: 'Cancelled',
          isCancelled: true,
          changeLabel: 'This session was cancelled.',
          waitlistLabel: 'On the waitlist.',
          venueLabel: null,
        })}
        onSelect={vi.fn()}
      />,
    );

    const card = screen.getByTestId(TEST_IDS.practiceSessionCard);
    expect(card).toHaveTextContent('Cancelled');
    expect(card).toHaveTextContent('This session was cancelled.');
    expect(card).toHaveTextContent('On the waitlist.');
  });

  it('selects the session on click', () => {
    const onSelect = vi.fn();
    render(
      <PracticeSessionCard
        card={buildPracticeSessionCardView({ id: 'sess-9' })}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceSessionCard));

    expect(onSelect).toHaveBeenCalledWith('sess-9');
  });
});
