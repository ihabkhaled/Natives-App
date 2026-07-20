import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildReviewPanelView,
  buildTrainingDetailView,
  buildTrainingWorkspaceView,
} from '../../../../../tests/factories/training-view.factory';
import { TrainingDetailBody } from '../training-detail-body';
import { TrainingReviewDecisionPanel } from '../training-review-decision-panel';
import { TrainingSubmissionList } from '../training-submission-list';
import { TrainingView } from './training-view.component';

describe('TrainingView', () => {
  it('renders the composer and the claim list when the screen is ready', () => {
    render(<TrainingView {...buildTrainingWorkspaceView()} />);

    expect(screen.getByTestId(TEST_IDS.trainingComposer)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.trainingSubmissionCard)).toHaveLength(1);
  });

  it('hides the composer from a principal who may not read training at all', () => {
    render(<TrainingView {...buildTrainingWorkspaceView({ status: 'forbidden' })} />);

    expect(screen.queryByTestId(TEST_IDS.trainingComposer)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingForbidden)).toBeInTheDocument();
  });

  it('separates "nothing logged" from "nothing matches the filter"', () => {
    const { rerender } = render(
      <TrainingView {...buildTrainingWorkspaceView({ status: 'empty', items: [] })} />,
    );
    expect(screen.getByTestId(TEST_IDS.trainingEmpty)).toBeInTheDocument();

    rerender(<TrainingView {...buildTrainingWorkspaceView({ hasMatches: false, items: [] })} />);
    expect(screen.getByText('Queue is clear')).toBeInTheDocument();
  });

  it('presents the offline and error states on their own', () => {
    const { rerender } = render(
      <TrainingView {...buildTrainingWorkspaceView({ status: 'offline' })} />,
    );
    expect(screen.getByTestId(TEST_IDS.trainingOffline)).toBeInTheDocument();

    rerender(<TrainingView {...buildTrainingWorkspaceView({ status: 'error' })} />);
    expect(screen.getByTestId(TEST_IDS.trainingError)).toBeInTheDocument();
  });
});

describe('TrainingSubmissionList', () => {
  it('opens the claim the member picked', () => {
    const onOpen = vi.fn();
    render(<TrainingSubmissionList items={buildTrainingWorkspaceView().items} onOpen={onOpen} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.trainingSubmissionOpen));

    expect(onOpen).toHaveBeenCalledWith('sub-1');
  });

  it('omits the buddy count when nobody was named', () => {
    render(
      <TrainingSubmissionList
        items={[{ ...buildTrainingWorkspaceView().items[0]!, buddyLabel: null }]}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText('1/2')).not.toBeInTheDocument();
  });
});

describe('TrainingDetailBody', () => {
  it('reports empty evidence, buddies, and history plainly', () => {
    render(<TrainingDetailBody view={buildTrainingDetailView()} />);

    expect(screen.getByText('No evidence attached yet.')).toBeInTheDocument();
    expect(screen.getByText('No buddies on this session.')).toBeInTheDocument();
    expect(screen.getByText('Nothing has happened yet.')).toBeInTheDocument();
  });

  it('renders the changes banner, the reviewer note, and every attachment', () => {
    render(
      <TrainingDetailBody
        view={buildTrainingDetailView({
          changesBanner: 'A reviewer asked for changes.',
          reviewNote: null,
          notes: null,
          evidence: [
            {
              id: 'ev-1',
              kindLabel: 'Link',
              reference: 'https://a.test',
              description: null,
              scanLabel: 'Scanned',
              scanTone: 'success',
            },
          ],
          buddies: [
            {
              id: 'b-1',
              membershipId: 'm-2',
              statusLabel: 'Confirmed',
              statusTone: 'success',
              respondedLabel: '11 Jul 2026',
            },
          ],
          history: [
            { key: 'created', label: 'Draft created', timeText: '10 Jul 2026', tone: 'medium' },
          ],
          actions: [
            {
              key: 'submit',
              label: 'Submit for review',
              testId: TEST_IDS.trainingSubmitAction,
              tone: 'primary',
              isBusy: false,
              onSelect: vi.fn(),
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.trainingChangesBanner)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingEvidenceItem)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingBuddyItem)).toHaveTextContent('11 Jul 2026');
    expect(screen.getByTestId(TEST_IDS.trainingSubmitAction)).toBeInTheDocument();
  });

  it('shows the reviewer note when one was left', () => {
    render(
      <TrainingDetailBody
        view={buildTrainingDetailView({ reviewNote: 'Attach the certificate.' })}
      />,
    );

    expect(screen.getByText('Attach the certificate.')).toBeInTheDocument();
  });
});

describe('TrainingReviewDecisionPanel', () => {
  it('says nothing stood out when there are no signals', () => {
    render(<TrainingReviewDecisionPanel view={buildReviewPanelView()} />);

    expect(screen.getByTestId(TEST_IDS.trainingReviewSignals)).toHaveTextContent(
      'Nothing stood out.',
    );
  });

  it('lists the advisory signals and the reviewer note error', () => {
    render(
      <TrainingReviewDecisionPanel
        view={buildReviewPanelView({
          notes: 'Lower body.',
          signals: [{ key: 'duplicate_day', label: 'Another claim covers this day.' }],
          noteError: 'A note is required for this decision.',
          actions: [
            {
              decision: 'reject',
              label: 'Reject',
              testId: TEST_IDS.trainingReviewReject,
              tone: 'danger',
              isBusy: false,
              onSelect: vi.fn(),
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Another claim covers this day.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('A note is required');
    expect(screen.getByTestId(TEST_IDS.trainingReviewReject)).toBeInTheDocument();
  });

  it('replaces the actions with a statement on a self review', () => {
    render(
      <TrainingReviewDecisionPanel
        view={buildReviewPanelView({ selfBlockedNotice: 'You cannot review your own claim.' })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('You cannot review your own claim.');
  });
});

describe('review decision interaction', () => {
  it('reports the note the reviewer typed', () => {
    const onNoteChange = vi.fn();
    render(<TrainingReviewDecisionPanel view={buildReviewPanelView({ onNoteChange })} />);

    fireEvent(
      screen.getByTestId(TEST_IDS.trainingReviewNote),
      new CustomEvent('ionInput', { detail: { value: 'Looks right.' } }),
    );
    fireEvent(
      screen.getByTestId(TEST_IDS.trainingReviewNote),
      new CustomEvent('ionInput', { detail: {} }),
    );

    expect(onNoteChange).toHaveBeenCalledWith('Looks right.');
    expect(onNoteChange).toHaveBeenCalledWith('');
  });

  it('reports the status filter the member picked', () => {
    const onStatusFilterChange = vi.fn();
    render(<TrainingView {...buildTrainingWorkspaceView({ onStatusFilterChange })} />);

    fireEvent(
      screen.getByTestId(TEST_IDS.trainingStatusFilter),
      new CustomEvent('ionChange', { detail: { value: 'draft' } }),
    );

    expect(onStatusFilterChange).toHaveBeenCalledWith('draft');
  });

  it('renders a danger-toned action with its danger treatment', () => {
    render(
      <TrainingDetailBody
        view={buildTrainingDetailView({
          actions: [
            {
              key: 'withdraw',
              label: 'Withdraw',
              testId: TEST_IDS.trainingWithdrawAction,
              tone: 'danger',
              isBusy: true,
              onSelect: vi.fn(),
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.trainingWithdrawAction)).toBeInTheDocument();
  });
});
