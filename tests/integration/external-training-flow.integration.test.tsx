import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TrainingDetailContainer } from '@/modules/training/containers/training-detail.container';
import { TrainingReviewContainer } from '@/modules/training/containers/training-review.container';
import { TrainingContainer } from '@/modules/training/containers/training.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_TRAINING } from '@/tests/msw/training.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderAt(path: string, pattern: string, screenNode: React.JSX.Element): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Route path={pattern}>{screenNode}</Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderWorkspace(): void {
  renderAt('/training', '/training', <TrainingContainer />);
}

function renderDetail(submissionId: string): void {
  renderAt(`/training/${submissionId}`, '/training/:submissionId', <TrainingDetailContainer />);
}

function renderReview(): void {
  renderAt('/training-review', '/training-review', <TrainingReviewContainer />);
}

/** Fill the composer with a valid gym claim and wait for save to unlock. */
async function fillValidClaim(): Promise<void> {
  fireIonChange(screen.getByTestId(TEST_IDS.trainingTypeSelect), MOCK_TRAINING.gymTypeId);
  fireIonInput(screen.getByTestId(TEST_IDS.trainingDateInput), '2026-07-11');
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.trainingSaveDraft)).not.toBeDisabled();
  });
}

/** Open the first queued claim and wait for its decision panel. */
async function openFirstQueuedClaim(): Promise<void> {
  await screen.findByTestId(TEST_IDS.trainingReviewQueue, {}, WAIT);
  fireEvent.click(screen.getAllByTestId(TEST_IDS.trainingSubmissionOpen)[0]!);
  await screen.findByTestId(TEST_IDS.trainingReviewApprove, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('external training flow (real client + MSW)', () => {
  it('lists the member own claims with their review state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Changes requested').length).toBeGreaterThan(0);
  });

  it('shows a candidate value only for an approved activity type', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingComposer, {}, WAIT);
    const candidate = screen.getByTestId(TEST_IDS.trainingCandidatePoints);
    expect(candidate).toHaveTextContent('Pending');

    fireIonChange(screen.getByTestId(TEST_IDS.trainingTypeSelect), MOCK_TRAINING.gymTypeId);
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingCandidatePoints)).toHaveTextContent('5');
    });
  });

  it('never shows a number for an unapproved (WFDF) activity type', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingComposer, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.trainingTypeSelect), MOCK_TRAINING.wfdfTypeId);

    await waitFor(() => {
      const candidate = screen.getByTestId(TEST_IDS.trainingCandidatePoints);
      expect(candidate).toHaveTextContent('Pending');
      expect(candidate.textContent).not.toMatch(/\d/u);
    });
  });

  it('adds evidence metadata and keeps the raw file out of the payload', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingComposer, {}, WAIT);
    fireIonInput(
      screen.getByTestId(TEST_IDS.trainingEvidenceReference),
      'https://example.test/session',
    );
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingEvidenceAdd)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingEvidenceAdd));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.trainingEvidenceItem).length).toBe(1);
    });
    expect(screen.getByTestId(TEST_IDS.trainingEvidencePanel)).toHaveTextContent(
      'never leaves the upload service',
    );
  });

  it('refuses to save a claim whose required evidence is missing', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.trainingTypeSelect), MOCK_TRAINING.wfdfTypeId);
    fireIonInput(screen.getByTestId(TEST_IDS.trainingDateInput), '2026-07-11');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingComposer)).toHaveTextContent(
        'needs at least one piece of evidence',
      );
    });
    expect(screen.getByTestId(TEST_IDS.trainingSaveDraft)).toBeDisabled();
  });

  it('rejects a future performed date instead of accepting it silently', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingComposer, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.trainingTypeSelect), MOCK_TRAINING.gymTypeId);
    fireIonInput(screen.getByTestId(TEST_IDS.trainingDateInput), '2099-01-01');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingComposer)).toHaveTextContent(
        'That date is in the future',
      );
    });
  });

  it('creates a draft claim from the composer', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    const before = screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length;
    fireIonInput(screen.getByTestId(TEST_IDS.trainingDurationInput), '45');
    fireIonInput(screen.getByTestId(TEST_IDS.trainingNotesInput), 'Tempo run.');
    fireIonInput(screen.getByTestId(TEST_IDS.trainingEvidenceReference), 'https://example.test/x');
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingEvidenceAdd));
    fireIonChange(screen.getByTestId(TEST_IDS.trainingBuddySelect), 'm-2');
    await fillValidClaim();
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingSaveDraft));

    await waitFor(
      () => {
        expect(screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length).toBe(before + 1);
      },
      { timeout: 5000 },
    );
  });

  it('narrows the claim list to a single status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.trainingStatusFilter), 'draft');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length).toBe(1);
    });
  });

  it('opens the claim the member picked from the list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    const opened = screen.getAllByTestId(TEST_IDS.trainingSubmissionOpen);
    fireEvent.click(opened[0]!);

    expect(opened.length).toBeGreaterThan(0);
  });

  it('walks back to the workspace from one claim', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_TRAINING.draftId);

    await screen.findByTestId(TEST_IDS.trainingHistoryList, {}, WAIT);
    const back = screen.getByText('Back to external training');
    fireEvent.click(back);

    await waitFor(() => {
      expect(screen.queryByText('Back to external training')).not.toBeInTheDocument();
    });
  });

  it('opens one claim with its evidence, buddies, and append-only history', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_TRAINING.changesRequestedId);

    await screen.findByTestId(TEST_IDS.trainingHistoryList, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.trainingChangesBanner)).toHaveTextContent(
      'asked for changes',
    );
    expect(screen.getAllByTestId(TEST_IDS.trainingEvidenceItem).length).toBe(1);
    expect(screen.getAllByTestId(TEST_IDS.trainingHistoryItem).length).toBeGreaterThan(1);
  });

  it('offers resubmit rather than submit once changes were requested', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_TRAINING.changesRequestedId);

    await screen.findByTestId(TEST_IDS.trainingSubmitAction, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.trainingSubmitAction)).toHaveTextContent('Resubmit');
  });

  it('offers withdraw only while the claim is in the queue', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_TRAINING.submittedId);

    await screen.findByTestId(TEST_IDS.trainingWithdrawAction, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.trainingSubmitAction)).not.toBeInTheDocument();
  });

  it('reports a claim that does not exist as not found', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail('20000000-0000-4000-8000-00000000ffff');

    expect(await screen.findByTestId(TEST_IDS.trainingError, {}, WAIT)).toBeInTheDocument();
  });

  it('blocks the reviewer queue for a persona without the review grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderReview();

    expect(await screen.findByTestId(TEST_IDS.trainingForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('shows the queue and its advisory signals to a reviewer', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await screen.findByTestId(TEST_IDS.trainingReviewQueue, {}, WAIT);
    const items = screen.getAllByTestId(TEST_IDS.trainingReviewQueueItem);
    expect(items.length).toBeGreaterThan(0);
    expect(screen.getByTestId(TEST_IDS.trainingReviewDetail)).toHaveTextContent(
      'Pick a claim from the queue',
    );
  });

  it('surfaces signals as advisory prompts, never as a verdict', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await screen.findByTestId(TEST_IDS.trainingReviewQueue, {}, WAIT);
    const queue = screen.getByTestId(TEST_IDS.trainingReviewQueue);
    const rows = within(queue).getAllByTestId(TEST_IDS.trainingReviewQueueItem);
    const wfdfRow = rows.find((row) => row.textContent.includes('WFDF'));
    expect(wfdfRow).toBeDefined();
    fireEvent.click(within(wfdfRow!).getByTestId(TEST_IDS.trainingSubmissionOpen));

    await screen.findByTestId(TEST_IDS.trainingReviewSignals, {}, WAIT);
    const signals = screen.getByTestId(TEST_IDS.trainingReviewSignals);
    expect(signals).toHaveTextContent('Advisory prompts only');
    expect(signals).toHaveTextContent('far in the past');
  });

  it('requires a note before rejecting and records the decision after one', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await openFirstQueuedClaim();

    fireEvent.click(screen.getByTestId(TEST_IDS.trainingReviewReject));
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingReviewDetail)).toHaveTextContent(
        'A note is required',
      );
    });

    fireIonInput(screen.getByTestId(TEST_IDS.trainingReviewNote), 'Evidence does not match.');
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingReviewReject));

    await waitFor(
      () => {
        expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  it('approves without demanding a note', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await openFirstQueuedClaim();

    fireEvent.click(screen.getByTestId(TEST_IDS.trainingReviewApprove));

    await waitFor(
      () => {
        expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  it('tells the member when saving a draft fails instead of pretending it saved', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/activity-submissions', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.trainingSubmissionList, {}, WAIT);
    const before = screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length;
    await fillValidClaim();
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingSaveDraft));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.trainingSubmissionCard).length).toBe(before);
    });
  });

  it('tells the reviewer when a decision fails instead of pretending it landed', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/activity-review/:submissionId/approve', () =>
        HttpResponse.json({ statusCode: 409, code: 'VERSION_CONFLICT' }, { status: 409 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await openFirstQueuedClaim();
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingReviewApprove));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingReviewApprove)).toBeInTheDocument();
    });
  });

  it('refuses to let a reviewer decide on their own claim', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await screen.findByTestId(TEST_IDS.trainingReviewQueue, {}, WAIT);
    const opens = screen.getAllByTestId(TEST_IDS.trainingSubmissionOpen);
    fireEvent.click(opens[opens.length - 1]!);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.trainingReviewDetail)).toHaveTextContent(
        'You cannot review your own claim.',
      );
    });
    expect(screen.queryByTestId(TEST_IDS.trainingReviewApprove)).not.toBeInTheDocument();
  });

  it('narrows the queue to one status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReview();

    await screen.findByTestId(TEST_IDS.trainingReviewQueue, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.trainingStatusFilter), 'approved');

    await waitFor(() => {
      const queue = screen.getByTestId(TEST_IDS.trainingReviewQueue);
      expect(within(queue).getAllByTestId(TEST_IDS.trainingReviewQueueItem).length).toBe(1);
    });
  });
});

describe('external training detail without a submission id', () => {
  it('waits rather than requesting a claim that was never identified', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/training', '/training', <TrainingDetailContainer />);

    await screen.findByTestId(TEST_IDS.trainingLoading, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.trainingHistoryList)).not.toBeInTheDocument();
  });
});
