import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionDetailData } from '../../../../../tests/factories/practice-view.factory';
import { PracticeSessionBody } from './practice-session-body.component';

function renderBody(overrides = {}) {
  render(
    <PracticeSessionBody
      detail={buildPracticeSessionDetailData()}
      isOffline={false}
      offlineNoticeLabel="Showing saved data."
      selectedReason={null}
      isSubmitting={false}
      conflictNote={null}
      onSelectReason={vi.fn()}
      onSubmitRsvp={vi.fn()}
      onOpenMap={vi.fn()}
      {...overrides}
    />,
  );
}

describe('PracticeSessionBody', () => {
  it('renders schedule, venue, agenda, counts, and RSVP sections', () => {
    renderBody();

    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceVenueInfo)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSessionAgenda)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceCounts)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.rsvpControl)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSubscriptionNote)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSessionChangeBanner)).not.toBeInTheDocument();
  });

  it('shows a change banner and hides instructions when appropriate', () => {
    renderBody({
      detail: buildPracticeSessionDetailData({
        changeHeading: 'This session changed',
        changeMessage: 'The venue was changed.',
        instructions: null,
      }),
    });

    const banner = screen.getByTestId(TEST_IDS.practiceSessionChangeBanner);
    expect(banner).toHaveAttribute('role', 'alert');
    expect(banner).toHaveTextContent('The venue was changed.');
    expect(screen.queryByText('Instructions')).not.toBeInTheDocument();
  });

  it('shows an offline indicator when offline', () => {
    renderBody({ isOffline: true });

    expect(screen.getByTestId(TEST_IDS.practiceSessionOffline)).toHaveTextContent(
      'Showing saved data.',
    );
  });

  it('strikes through a cancelled session title', () => {
    renderBody({
      detail: buildPracticeSessionDetailData({ title: 'League game', isCancelled: true }),
    });

    expect(screen.getByRole('heading', { name: 'League game' })).toHaveClass('line-through');
  });
});
