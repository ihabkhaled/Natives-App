import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildCandidateRowView,
  buildEligibilityPanelView,
  buildOverrideDialogView,
} from '../../../../../tests/factories/competitions-view.factory';
import { SquadEligibilityPanel } from './squad-eligibility-panel.component';

describe('SquadEligibilityPanel', () => {
  it('always states that the signals are advisory', () => {
    render(<SquadEligibilityPanel view={buildEligibilityPanelView()} />);

    expect(screen.getByTestId(TEST_IDS.squadEligibilityAdvisory)).toHaveTextContent(
      'Advisory inputs only.',
    );
  });

  it('says the panel is empty rather than rendering an empty table', () => {
    render(<SquadEligibilityPanel view={buildEligibilityPanelView({ rows: [] })} />);

    expect(screen.getByText('No candidates are in scope yet.')).toBeInTheDocument();
    expect(screen.queryAllByTestId(TEST_IDS.squadEligibilityRow)).toHaveLength(0);
  });

  it('shows the locked notice when selection is frozen', () => {
    render(
      <SquadEligibilityPanel
        view={buildEligibilityPanelView({ lockedNotice: 'This squad is locked.' })}
      />,
    );

    expect(screen.getByText('This squad is locked.')).toBeInTheDocument();
  });

  it('shows the override hint on a flagged row', () => {
    render(
      <SquadEligibilityPanel
        view={buildEligibilityPanelView({
          rows: [
            buildCandidateRowView({
              needsOverride: true,
              overrideHint: 'Selecting this player records a coach override.',
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Selecting this player records a coach override.')).toBeInTheDocument();
  });

  it('renders the remove action for a player already in the squad', () => {
    render(
      <SquadEligibilityPanel
        view={buildEligibilityPanelView({
          rows: [buildCandidateRowView({ isSelected: true, actionLabel: 'Remove' })],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.squadRemoveAction)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.squadSelectAction)).not.toBeInTheDocument();
  });

  it('mounts the override dialog only when one is pending', () => {
    const { rerender } = render(<SquadEligibilityPanel view={buildEligibilityPanelView()} />);
    expect(screen.queryByTestId(TEST_IDS.squadOverridePanel)).not.toBeInTheDocument();

    rerender(
      <SquadEligibilityPanel
        view={buildEligibilityPanelView({ override: buildOverrideDialogView() })}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.squadOverridePanel)).toBeInTheDocument();
  });
});
