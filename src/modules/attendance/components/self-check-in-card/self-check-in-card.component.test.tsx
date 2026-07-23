import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { SelfCheckInCardView } from '../../types/attendance-view.types';
import { SelfCheckInCard } from './self-check-in-card.component';

function buildView(overrides: Partial<SelfCheckInCardView> = {}): SelfCheckInCardView {
  return {
    title: 'Session check-in',
    sessionLabel: 'Evening practice · 26 Jul, 5:00 PM',
    noSessionMessage: 'No upcoming session to check in to.',
    isLoading: false,
    loadingLabel: 'Loading…',
    statusChip: null,
    stateMessage: null,
    provisionalNotice: 'Subject to confirmation by your coach.',
    offlineNotice: null,
    canCheckIn: true,
    checkInLabel: 'Check in',
    isSubmitting: false,
    noteLabel: 'Note (optional)',
    noteValue: '',
    onNoteChange: vi.fn(),
    onCheckIn: vi.fn(),
    ...overrides,
  };
}

describe('SelfCheckInCard', () => {
  it('arms the check-in flow with the note field and provisional caveat', () => {
    const view = buildView();
    render(<SelfCheckInCard view={view} />);

    expect(screen.getByText(/Evening practice/u)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInNote)).toBeInTheDocument();
    expect(screen.getByText('Subject to confirmation by your coach.')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(TEST_IDS.myAttendanceCheckInButton));
    expect(view.onCheckIn).toHaveBeenCalledOnce();
  });

  it('arms the button without the caveat once the server rules the window', () => {
    render(<SelfCheckInCard view={buildView({ provisionalNotice: null })} />);

    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInButton)).toBeInTheDocument();
    expect(screen.queryByText(/Subject to confirmation/u)).not.toBeInTheDocument();
  });

  it('shows the recorded chip and state copy without any button', () => {
    render(
      <SelfCheckInCard
        view={buildView({
          canCheckIn: false,
          statusChip: { label: 'Present', tone: 'success' },
          stateMessage: 'Recorded by you',
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInStatus)).toBeInTheDocument();
    expect(screen.getByText('Recorded by you')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
  });

  it('explains the no-offline-queue policy while disconnected', () => {
    render(
      <SelfCheckInCard
        view={buildView({ canCheckIn: false, offlineNotice: 'Check-in needs a connection.' })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Check-in needs a connection.');
  });

  it('falls back to the honest no-session message', () => {
    render(<SelfCheckInCard view={buildView({ sessionLabel: null, canCheckIn: false })} />);

    expect(screen.getByText('No upcoming session to check in to.')).toBeInTheDocument();
  });

  it('keeps a skeleton while the own record loads', () => {
    render(<SelfCheckInCard view={buildView({ isLoading: true })} />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
  });
});
