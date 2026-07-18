import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';
import { buildRsvpControlData } from '../../../../../tests/factories/practice-view.factory';
import { RSVP_REASON, RSVP_STATUS } from '../../constants/practice.constants';
import { RsvpControl } from './rsvp-control.component';

function setupControl(props: Partial<Parameters<typeof RsvpControl>[0]> = {}) {
  const merged = {
    data: buildRsvpControlData(),
    selectedReason: null,
    isSubmitting: false,
    conflictNote: null,
    onSelectReason: vi.fn(),
    onSubmit: vi.fn(),
    ...props,
  };
  render(<RsvpControl {...merged} />);
  return merged;
}

describe('RsvpControl', () => {
  it('submits the chosen response', () => {
    const props = setupControl();

    fireEvent.click(screen.getByTestId(TEST_IDS.rsvpGoingButton));

    expect(props.onSubmit).toHaveBeenCalledWith(RSVP_STATUS.going);
  });

  it('reports the picked reason, mapping the none option to null', () => {
    const props = setupControl();

    fireIonChange(screen.getByTestId(TEST_IDS.rsvpReasonSelect), RSVP_REASON.injury);
    expect(props.onSelectReason).toHaveBeenCalledWith(RSVP_REASON.injury);

    fireIonChange(screen.getByTestId(TEST_IDS.rsvpReasonSelect), '');
    expect(props.onSelectReason).toHaveBeenCalledWith(null);
  });

  it('shows the deadline hint while open', () => {
    setupControl();

    expect(screen.getByTestId(TEST_IDS.rsvpDeadlineNote)).toHaveTextContent('Respond by');
  });

  it('closes the controls with an explanation past the deadline', () => {
    setupControl({
      data: buildRsvpControlData({
        canRespond: false,
        showReason: false,
        deadlineLabel: null,
        disabledExplanation: 'The RSVP deadline has passed.',
      }),
    });

    expect(screen.getByTestId(TEST_IDS.rsvpDeadlineNote)).toHaveTextContent(
      'The RSVP deadline has passed.',
    );
    expect(screen.queryByTestId(TEST_IDS.rsvpReasonSelect)).not.toBeInTheDocument();
  });

  it('marks the active response and busy state', () => {
    setupControl({
      isSubmitting: true,
      data: buildRsvpControlData({
        options: [
          {
            value: RSVP_STATUS.going,
            label: 'Going',
            color: 'success',
            testId: TEST_IDS.rsvpGoingButton,
            isActive: true,
          },
        ],
      }),
    });

    expect(screen.getByTestId(TEST_IDS.rsvpControl)).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId(TEST_IDS.rsvpGoingButton)).toHaveAttribute('aria-pressed', 'true');
  });

  it('surfaces waitlist and conflict notices', () => {
    setupControl({
      conflictNote: 'Please review the latest state.',
      data: buildRsvpControlData({ waitlistLabel: 'You are on the waitlist.' }),
    });

    expect(screen.getByTestId(TEST_IDS.rsvpWaitlistNote)).toHaveTextContent(
      'You are on the waitlist.',
    );
    expect(screen.getByTestId(TEST_IDS.rsvpConflictNote)).toHaveTextContent(
      'Please review the latest state.',
    );
  });
});
