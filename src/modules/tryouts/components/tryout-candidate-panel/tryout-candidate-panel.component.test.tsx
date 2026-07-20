import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildCandidatePanelView,
  buildConversionPanelView,
  buildDecisionPanelView,
  buildEvaluationPanelView,
  buildRestrictedBlockView,
  buildTryoutDetailView,
} from '../../../../../tests/factories/competitions-view.factory';
import { TryoutCandidateList } from '../tryout-candidate-list/tryout-candidate-list.component';
import { TryoutConversionPanel } from '../tryout-conversion-panel/tryout-conversion-panel.component';
import { TryoutDecisionPanel } from '../tryout-decision-panel/tryout-decision-panel.component';
import { TryoutDetailView } from '../tryout-detail-view/tryout-detail-view.component';
import { TryoutEvaluationPanel } from '../tryout-evaluation-panel/tryout-evaluation-panel.component';
import { TryoutRestrictedBlock } from '../tryout-restricted-block/tryout-restricted-block.component';
import { TryoutCandidatePanel } from './tryout-candidate-panel.component';

const NOOP = (): void => {
  // inert handler for a UI-only assertion
};

describe('TryoutRestrictedBlock', () => {
  it('renders the permission state, not the fields, without the grant', () => {
    render(
      <TryoutRestrictedBlock
        view={buildRestrictedBlockView()}
        testId={TEST_IDS.tryoutContacts}
        restrictedTestId={TEST_IDS.tryoutContactsRestricted}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.tryoutContactsRestricted)).toBeInTheDocument();
    expect(screen.queryByText('Each read is audited.')).not.toBeInTheDocument();
  });

  it('renders the facts and the audit notice with the grant', () => {
    render(
      <TryoutRestrictedBlock
        view={buildRestrictedBlockView({
          isPermitted: true,
          facts: [{ key: 'email', label: 'Email', value: 'one@example.test' }],
        })}
        testId={TEST_IDS.tryoutContacts}
        restrictedTestId={TEST_IDS.tryoutContactsRestricted}
      />,
    );

    expect(screen.getByText('one@example.test')).toBeInTheDocument();
    expect(screen.getByText('Each read is audited.')).toBeInTheDocument();
  });
});

describe('TryoutEvaluationPanel', () => {
  it('treats a cleared note field as an empty note', () => {
    const onNoteChange = vi.fn();
    render(<TryoutEvaluationPanel view={buildEvaluationPanelView({ onNoteChange })} />);
    fireEvent(
      screen.getByTestId(TEST_IDS.tryoutEvaluationNote),
      new CustomEvent('ionInput', { detail: {} }),
    );

    expect(onNoteChange).toHaveBeenCalledWith('');
  });

  it('offers the save action to a permitted evaluator', () => {
    render(<TryoutEvaluationPanel view={buildEvaluationPanelView()} />);

    expect(screen.getByTestId(TEST_IDS.tryoutEvaluationSubmit)).toBeInTheDocument();
  });

  it('replaces the save action with an explanation when forbidden', () => {
    render(
      <TryoutEvaluationPanel
        view={buildEvaluationPanelView({ forbiddenNotice: 'You need the evaluator grant.' })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.tryoutEvaluationSubmit)).not.toBeInTheDocument();
    expect(screen.getAllByText('You need the evaluator grant.').length).toBeGreaterThan(0);
  });
});

describe('TryoutDecisionPanel', () => {
  it('treats a cleared reason field as an empty reason', () => {
    const onReasonChange = vi.fn();
    render(<TryoutDecisionPanel view={buildDecisionPanelView({ onReasonChange })} />);
    fireEvent(
      screen.getByTestId(TEST_IDS.tryoutDecisionReason),
      new CustomEvent('ionInput', { detail: {} }),
    );

    expect(onReasonChange).toHaveBeenCalledWith('');
  });

  it('shows the recorded decision and its offer expiry', async () => {
    render(
      <TryoutDecisionPanel
        view={buildDecisionPanelView({
          currentLabel: 'Accepted',
          offerExpiryLabel: 'Offer expires: 30 Aug',
          validationMessage: null,
          actions: [
            {
              outcome: 'decline',
              label: 'Decline',
              tone: 'danger',
              testId: TEST_IDS.tryoutDecisionDecline,
              onSelect: NOOP,
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByText('Accepted').length).toBeGreaterThan(0);
    expect(screen.getByText('Offer expires: 30 Aug')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutDecisionDecline)).not.toBeDisabled();
    });
  });

  it('disables the actions while the reason is missing', async () => {
    render(
      <TryoutDecisionPanel
        view={buildDecisionPanelView({
          actions: [
            {
              outcome: 'accept',
              label: 'Accept',
              tone: 'primary',
              testId: TEST_IDS.tryoutDecisionAccept,
              onSelect: NOOP,
            },
          ],
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutDecisionAccept)).toBeDisabled();
    });
  });
});

describe('TryoutConversionPanel', () => {
  it('blocks the action and says why when conversion is not allowed yet', async () => {
    render(
      <TryoutConversionPanel
        view={buildConversionPanelView({ blockedNotice: 'Only an accepted candidate.' })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).toBeDisabled();
    });
    expect(screen.getByText('Only an accepted candidate.')).toBeInTheDocument();
  });

  it('enables the action for an accepted candidate with the grant', async () => {
    render(<TryoutConversionPanel view={buildConversionPanelView()} />);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).not.toBeDisabled();
    });
  });
});

describe('TryoutCandidateList and TryoutCandidatePanel', () => {
  it('says the roll is empty rather than rendering an empty list', () => {
    render(
      <TryoutCandidateList
        items={[]}
        emptyLabel="No candidate has registered yet."
        onSelect={NOOP}
        onCheckIn={NOOP}
      />,
    );

    expect(screen.getByText('No candidate has registered yet.')).toBeInTheDocument();
  });

  it('hides check-in for a candidate already through the door', () => {
    render(
      <TryoutCandidateList
        items={[
          {
            candidateId: 'c1',
            reference: 'UN-1',
            displayName: 'Candidate One',
            statusLabel: 'Converted to member',
            statusTone: 'primary',
            checkedInLabel: 'Checked in at 14:40',
            canCheckIn: false,
            checkInLabel: 'Check in',
            openLabel: 'Open',
            isSelected: true,
          },
        ]}
        emptyLabel="No candidate has registered yet."
        onSelect={NOOP}
        onCheckIn={NOOP}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.tryoutCheckIn)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutCandidateRow)).toHaveTextContent(
      'Checked in at 14:40',
    );
  });

  it('renders every restricted and workflow block for one candidate', () => {
    render(<TryoutCandidatePanel view={buildCandidatePanelView()} />);

    expect(screen.getByTestId(TEST_IDS.tryoutContacts)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutReadiness)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutEvaluationPanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutDecisionPanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutConversionPanel)).toBeInTheDocument();
  });
});

describe('TryoutDetailView', () => {
  it('prompts for a candidate before mounting any panel', () => {
    render(<TryoutDetailView {...buildTryoutDetailView()} />);

    expect(screen.getByText('Pick a candidate to review their tryout.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.tryoutCandidatePanel)).not.toBeInTheDocument();
  });

  it('mounts the candidate panel once one is selected', () => {
    render(<TryoutDetailView {...buildTryoutDetailView({ panel: buildCandidatePanelView() })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutCandidatePanel)).toBeInTheDocument();
  });

  it('renders only the async state block while loading', () => {
    render(<TryoutDetailView {...buildTryoutDetailView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.tryoutCandidateList)).not.toBeInTheDocument();
  });
});
