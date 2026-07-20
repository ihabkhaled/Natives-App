import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TryoutDetailContainer } from '@/modules/tryouts/containers/tryout-detail.container';
import { TryoutsContainer } from '@/modules/tryouts/containers/tryouts.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_TRYOUTS } from '@/tests/msw/tryouts.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderWorkspace(): void {
  renderRoute(
    `/tryouts/${MOCK_TRYOUTS.openEventId}`,
    '/tryouts/:tryoutId',
    <TryoutDetailContainer />,
  );
}

function rowFor(name: string): HTMLElement {
  const rows = screen.getAllByTestId(TEST_IDS.tryoutCandidateRow);
  const match = rows.find((row) => row.textContent.includes(name));
  expect(match).toBeDefined();
  return match!;
}

/** Render the workspace and check the first registered candidate in. */
async function checkInFirstCandidate(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderWorkspace();
  await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
  fireEvent.click(within(rowFor('Candidate One')).getByTestId(TEST_IDS.tryoutCheckIn));
}

/** Render the workspace, open one candidate, and wait for their panel. */
async function openCandidate(name: string): Promise<void> {
  renderWorkspace();
  await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
  fireEvent.click(within(rowFor(name)).getByTestId(TEST_IDS.tryoutCandidateOpen));
  await screen.findByTestId(TEST_IDS.tryoutCandidatePanel, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('tryout event list', () => {
  it('lists the events with capacity and the backend-pending notice', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/tryouts', '/tryouts', <TryoutsContainer />);

    await screen.findByTestId(TEST_IDS.tryoutsList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.tryoutCard)).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.tryoutBackendPending)).toHaveTextContent('not deployed yet');
  });

  it('blocks the staff list for a member without the tryout grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute('/tryouts', '/tryouts', <TryoutsContainer />);

    expect(await screen.findByTestId(TEST_IDS.tryoutsForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('opens the event a coach picked', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/tryouts', '/tryouts', <TryoutsContainer />);

    await screen.findByTestId(TEST_IDS.tryoutsList, {}, WAIT);
    const open = screen.getAllByTestId(TEST_IDS.tryoutOpen);
    fireEvent.click(open[0]!);

    expect(open).toHaveLength(2);
  });

  it('renders the error state when the event list fails', async () => {
    mockApiServer.use(
      http.get('*/teams/:teamId/tryouts', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/tryouts', '/tryouts', <TryoutsContainer />);

    expect(await screen.findByTestId(TEST_IDS.tryoutsError, {}, WAIT)).toBeInTheDocument();
  });
});

describe('candidate roll keeps restricted data out of the list', () => {
  it('lists candidates by reference and status only', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWorkspace();

    const list = await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.tryoutCandidateRow)).toHaveLength(4);
    expect(list.textContent).not.toContain('@example.test');
    expect(list.textContent).not.toContain('ankle');
  });

  it('narrows the roll to one candidate status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.tryoutStatusFilter), 'accepted');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.tryoutCandidateRow)).toHaveLength(1);
    });
  });

  it('prompts for a candidate before any detail is shown', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
    expect(screen.getByText('Pick a candidate to review their tryout.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.tryoutCandidatePanel)).not.toBeInTheDocument();
  });

  it('checks a registered candidate in', async () => {
    await checkInFirstCandidate();

    await waitFor(
      () => {
        expect(rowFor('Candidate One')).toHaveTextContent('Checked in');
      },
      { timeout: 5000 },
    );
  });

  it('leaves the candidate registered when check-in fails', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/tryouts/:tryoutId/candidates/:candidateId/check-in', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await checkInFirstCandidate();

    await waitFor(() => {
      expect(rowFor('Candidate One')).toHaveTextContent('Registered');
    });
  });

  it('offers no check-in for someone already through the door', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
    expect(
      within(rowFor('Candidate Four')).queryByTestId(TEST_IDS.tryoutCheckIn),
    ).not.toBeInTheDocument();
  });
});

describe('restricted candidate data', () => {
  it('hides contacts and readiness from a coach without those grants', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    await openCandidate('Candidate One');

    expect(screen.getByTestId(TEST_IDS.tryoutContactsRestricted)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutReadinessRestricted)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutCandidatePanel).textContent).not.toContain(
      'candidate.one@example.test',
    );
  });

  it('shows contacts and readiness to an administrator who holds them', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate One');

    expect(screen.getByTestId(TEST_IDS.tryoutContacts)).toHaveTextContent(
      'candidate.one@example.test',
    );
    expect(screen.getByTestId(TEST_IDS.tryoutReadiness)).toHaveTextContent('ankle sprain');
    expect(screen.queryByTestId(TEST_IDS.tryoutContactsRestricted)).not.toBeInTheDocument();
  });

  it('shows the accepted consent version with the candidate', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate One');

    expect(screen.getByTestId(TEST_IDS.tryoutCandidatePanel)).toHaveTextContent(
      MOCK_TRYOUTS.consentVersion,
    );
  });
});

describe('a tryout workspace opened without its route parameter', () => {
  it('waits instead of requesting an event that was never identified', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute('/tryouts', '/tryouts', <TryoutDetailContainer />);

    expect(await screen.findByTestId(TEST_IDS.tryoutsLoading, {}, WAIT)).toBeInTheDocument();
  });
});

describe('evaluation, decision, and conversion', () => {
  it('shows an unscored criterion as "not scored", never as zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate Two');

    const panel = screen.getByTestId(TEST_IDS.tryoutEvaluationPanel);
    expect(panel).toHaveTextContent('Not scored');
    expect(panel.textContent).not.toContain('0');
  });

  it('saves an evaluation with its note', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate One');

    const scores = screen.getAllByTestId(TEST_IDS.tryoutEvaluationScore);
    fireIonChange(scores[0]!, '4');
    fireIonInput(screen.getByTestId(TEST_IDS.tryoutEvaluationNote), 'Strong cutter.');
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutEvaluationSubmit));

    await waitFor(
      () => {
        expect(rowFor('Candidate One')).toHaveTextContent('Evaluated');
      },
      { timeout: 5000 },
    );
  });

  it('blocks the whole workspace for a member without the tryout grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    expect(await screen.findByTestId(TEST_IDS.tryoutsForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('refuses a decision until a reason is written', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate Two');

    expect(screen.getByTestId(TEST_IDS.tryoutDecisionAccept)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.tryoutDecisionPanel)).toHaveTextContent(
      'at least 5 characters',
    );
  });

  it('records a decision once a reason is written', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate Two');

    fireIonInput(
      screen.getByTestId(TEST_IDS.tryoutDecisionReason),
      'Consistent across every drill.',
    );
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutDecisionAccept)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutDecisionAccept));

    await waitFor(
      () => {
        expect(rowFor('Candidate Two')).toHaveTextContent('Accepted');
      },
      { timeout: 5000 },
    );
  });

  it('hides the decision actions from a coach without the decide grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    await openCandidate('Candidate Two');

    expect(screen.queryByTestId(TEST_IDS.tryoutDecisionAccept)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutDecisionPanel)).toHaveTextContent(
      'need the decision grant',
    );
  });

  it('blocks conversion for a candidate who was never accepted', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate One');

    expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.tryoutConversionPanel)).toHaveTextContent(
      'Only an accepted candidate',
    );
  });

  it('says an already-converted candidate is already a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate Four');

    expect(screen.getByTestId(TEST_IDS.tryoutConversionPanel)).toHaveTextContent(
      'already a member',
    );
    expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).toBeDisabled();
  });

  it('previews an existing account before converting an accepted candidate', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    await openCandidate('Candidate Three');

    expect(screen.getByTestId(TEST_IDS.tryoutConversionPreview)).toHaveTextContent(
      'An account already exists',
    );
    expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).not.toBeDisabled();
  });

  it('blocks conversion for a coach without the conversion grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    await openCandidate('Candidate Three');

    expect(screen.getByTestId(TEST_IDS.tryoutConversionPanel)).toHaveTextContent(
      'need the conversion grant',
    );
    expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).toBeDisabled();
  });

  it('walks back to the tryout list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
    fireEvent.click(screen.getByText('Back to tryouts'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.tryoutCandidateList)).not.toBeInTheDocument();
    });
  });

  it('reports a tryout event that does not exist as not found', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(
      '/tryouts/f0000000-0000-4000-8000-0000000000ff',
      '/tryouts/:tryoutId',
      <TryoutDetailContainer />,
    );

    expect(await screen.findByTestId(TEST_IDS.tryoutsError, {}, WAIT)).toBeInTheDocument();
  });
});
