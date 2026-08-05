import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { RsvpHistoryPanel } from './rsvp-history-panel.component';
import type { RsvpHistoryPanelProps } from './rsvp-history-panel.types';

function props(overrides: Partial<RsvpHistoryPanelProps> = {}): RsvpHistoryPanelProps {
  return {
    membershipId: 'member-1',
    headingLabel: 'RSVP history',
    isLoading: false,
    loadingLabel: 'Loading history…',
    emptyLabel: 'No history recorded yet.',
    items: [],
    closeLabel: 'Close history',
    onClose: vi.fn(),
    ...overrides,
  };
}

describe('RsvpHistoryPanel', () => {
  it('shows the loading label while the trail is still arriving', () => {
    render(<RsvpHistoryPanel {...props({ isLoading: true })} />);

    expect(screen.getByText('Loading history…')).toBeInTheDocument();
  });

  it('shows the empty label once loaded with nothing recorded', () => {
    render(<RsvpHistoryPanel {...props()} />);

    expect(screen.getByText('No history recorded yet.')).toBeInTheDocument();
  });

  it('renders one entry per revision', () => {
    render(
      <RsvpHistoryPanel
        {...props({
          items: [
            {
              id: 'rev-1',
              transitionLabel: 'Changed from Maybe to Not going',
              occurredLabel: 'July 21, 2026 8:00 AM',
              attributionLabel: 'Overridden by a coach',
              reasonLabel: 'Reported unavailable.',
              noteLabel: null,
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.practiceRsvpDetailHistoryItem)).toHaveLength(1);
    expect(screen.getByText('Changed from Maybe to Not going')).toBeInTheDocument();
    expect(screen.getByText('Reported unavailable.')).toBeInTheDocument();
  });

  it('renders the note line when a revision carries one', () => {
    render(
      <RsvpHistoryPanel
        {...props({
          items: [
            {
              id: 'rev-2',
              transitionLabel: 'Set to Going',
              occurredLabel: 'July 20, 2026 9:00 AM',
              attributionLabel: 'Recorded (Answered themselves)',
              reasonLabel: null,
              noteLabel: 'Called ahead to confirm.',
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Called ahead to confirm.')).toBeInTheDocument();
    expect(screen.queryByText('Reported unavailable.')).not.toBeInTheDocument();
  });

  it('closes from its own button', () => {
    const onClose = vi.fn();
    render(<RsvpHistoryPanel {...props({ onClose })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailHistoryClose));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
