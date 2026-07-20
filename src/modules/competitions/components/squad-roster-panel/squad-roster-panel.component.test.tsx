import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAvailabilityPanelView,
  buildOverrideDialogView,
  buildRosterPanelView,
} from '../../../../../tests/factories/competitions-view.factory';
import { SquadAvailabilityPanel } from '../squad-availability-panel/squad-availability-panel.component';
import { SquadOverrideDialog } from '../squad-override-dialog/squad-override-dialog.component';
import { SquadRosterPanel } from './squad-roster-panel.component';

describe('SquadRosterPanel', () => {
  it('always carries the backend-pending notice', () => {
    render(<SquadRosterPanel view={buildRosterPanelView()} />);

    expect(screen.getByTestId(TEST_IDS.squadRosterPendingNotice)).toHaveTextContent(
      'roster screens',
    );
  });

  it('says nobody is selected instead of rendering an empty table', () => {
    render(<SquadRosterPanel view={buildRosterPanelView()} />);

    expect(screen.getByText('No player has been selected yet.')).toBeInTheDocument();
    expect(screen.queryAllByTestId(TEST_IDS.squadRosterRow)).toHaveLength(0);
  });

  it('prints every rostered player, including one with nothing recorded', () => {
    render(
      <SquadRosterPanel
        view={buildRosterPanelView({
          rows: [
            {
              membershipId: 'm-2',
              fullName: 'Nour Kamal',
              jerseyLabel: 'Unassigned',
              roleLabel: 'Player',
              availabilityLabel: 'Not declared',
              attendanceLabel: 'Not enough data',
            },
          ],
        })}
      />,
    );

    const row = screen.getByTestId(TEST_IDS.squadRosterRow);
    expect(row).toHaveTextContent('Not enough data');
    expect(row.textContent).not.toMatch(/\b0\b/u);
  });
});

describe('SquadAvailabilityPanel', () => {
  it('treats a cleared reason field as an empty reason', () => {
    const onReasonChange = vi.fn();
    render(<SquadAvailabilityPanel view={buildAvailabilityPanelView({ onReasonChange })} />);
    fireEvent(
      screen.getByTestId(TEST_IDS.squadAvailabilityReason),
      new CustomEvent('ionInput', { detail: {} }),
    );

    expect(onReasonChange).toHaveBeenCalledWith('');
  });

  it('says nobody has declared yet when the list is empty', () => {
    render(<SquadAvailabilityPanel view={buildAvailabilityPanelView()} />);

    expect(screen.getByText('Nobody has declared availability yet.')).toBeInTheDocument();
  });

  it('lists a declaration with its source and reason', () => {
    render(
      <SquadAvailabilityPanel
        view={buildAvailabilityPanelView({
          windowNotice: 'The selection deadline has passed.',
          rows: [
            {
              key: 'av-1',
              membershipId: 'm-1',
              availabilityLabel: 'Unavailable',
              sourceLabel: 'Recorded by a coach',
              reason: 'Travelling',
            },
          ],
        })}
      />,
    );

    const row = screen.getByTestId(TEST_IDS.squadAvailabilityRow);
    expect(row).toHaveTextContent('Recorded by a coach');
    expect(row).toHaveTextContent('Travelling');
    expect(screen.getByText('The selection deadline has passed.')).toBeInTheDocument();
  });

  it('omits the reason line when there is none', () => {
    render(
      <SquadAvailabilityPanel
        view={buildAvailabilityPanelView({
          rows: [
            {
              key: 'av-1',
              membershipId: 'm-1',
              availabilityLabel: 'Available',
              sourceLabel: 'Declared by the player',
              reason: null,
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.squadAvailabilityRow)).toHaveTextContent(
      'Declared by the player',
    );
  });
});

describe('SquadOverrideDialog', () => {
  it('stays locked while the previous override is still saving', async () => {
    render(
      <SquadOverrideDialog
        view={buildOverrideDialogView({
          reasonValue: 'Needed for handler depth',
          validationMessage: null,
          canConfirm: false,
          isSaving: true,
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).toBeDisabled();
    });
  });

  it('treats a cleared reason field as an empty reason', () => {
    const onReasonChange = vi.fn();
    render(<SquadOverrideDialog view={buildOverrideDialogView({ onReasonChange })} />);
    fireEvent(
      screen.getByTestId(TEST_IDS.squadOverrideReason),
      new CustomEvent('ionInput', { detail: {} }),
    );

    expect(onReasonChange).toHaveBeenCalledWith('');
  });

  it('blocks confirmation while the reason is too short', async () => {
    render(<SquadOverrideDialog view={buildOverrideDialogView()} />);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).toBeDisabled();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('at least 5 characters');
  });

  it('unlocks confirmation and drops the alert once the reason is valid', async () => {
    render(
      <SquadOverrideDialog
        view={buildOverrideDialogView({
          reasonValue: 'Needed for handler depth',
          validationMessage: null,
          canConfirm: true,
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).not.toBeDisabled();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
