import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RosterDetailContainer } from '@/modules/competitions/containers/roster-detail.container';
import { RostersContainer } from '@/modules/competitions/containers/rosters.container';
import { SquadDetailContainer } from '@/modules/competitions/containers/squad-detail.container';
import { TryoutDetailContainer } from '@/modules/tryouts/containers/tryout-detail.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_ROSTERS } from '@/tests/msw/rosters.fixture';
import { MOCK_SQUADS } from '@/tests/msw/squads.fixture';
import { MOCK_TRYOUTS } from '@/tests/msw/tryouts.fixture';

import { confirmResult } from '../setup/confirm-alert-stub.helper';
import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

/**
 * Every confirm-gated write in one place: roster lifecycle, squad publish,
 * and tryout conversion all confirm through an Ionic alert overlay jsdom
 * cannot drive, so only the confirmation is stubbed here.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const stub = await import('../setup/confirm-alert-stub.helper');
  return stub.withConfirmStub(await importOriginal<Record<string, unknown>>());
});

const WAIT = { timeout: 5000 };

function renderRoster(rosterId: string): void {
  renderRoute(`/rosters/${rosterId}`, '/rosters/:rosterId', <RosterDetailContainer />);
}

function renderSquad(squadId: string): void {
  renderRoute(`/squads/${squadId}`, '/squads/:squadId', <SquadDetailContainer />);
}

/** The roster entry row, or the tryout candidate row, matched by its text. */
function rowFor(testId: string, name: string): HTMLElement {
  const rows = screen.getAllByTestId(testId);
  const match = rows.find((row) => row.textContent.includes(name));
  expect(match).toBeDefined();
  return match!;
}

async function openAcceptedCandidate(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderRoute(
    `/tryouts/${MOCK_TRYOUTS.openEventId}`,
    '/tryouts/:tryoutId',
    <TryoutDetailContainer />,
  );
  await screen.findByTestId(TEST_IDS.tryoutCandidateList, {}, WAIT);
  fireEvent.click(
    within(rowFor(TEST_IDS.tryoutCandidateRow, 'Candidate Three')).getByTestId(
      TEST_IDS.tryoutCandidateOpen,
    ),
  );
  await screen.findByTestId(TEST_IDS.tryoutConversionPanel, {}, WAIT);
}

/** Open the seeded competition roster and withdraw its first player. */
async function removeFirstRosterEntry(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.coach);
  renderRoster(MOCK_ROSTERS.competitionRosterId);
  await screen.findByTestId(TEST_IDS.rosterEntriesPanel, {}, WAIT);
  const rows = screen.getAllByTestId(TEST_IDS.rosterEntryRow);
  fireEvent.click(within(rows[0]!).getByTestId(TEST_IDS.rosterEntryRemove));
}

async function openDraftSquad(): Promise<HTMLElement[]> {
  await signInAs(MOCK_PERSONA_EMAILS.coach);
  renderSquad(MOCK_SQUADS.draftId);
  await screen.findByTestId(TEST_IDS.squadHeader, {}, WAIT);
  return screen.getAllByTestId(TEST_IDS.squadTransition);
}

beforeEach(async () => {
  confirmResult.value = true;
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});
describe('roster list (live endpoints)', () => {
  it('lists the competition and match rosters', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/rosters', '/rosters', <RostersContainer />);

    await screen.findByTestId(TEST_IDS.rostersList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.rosterCard)).toHaveLength(3);
  });

  it('narrows the list to match rosters', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/rosters', '/rosters', <RostersContainer />);

    await screen.findByTestId(TEST_IDS.rostersList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.rostersKindFilter), 'match');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.rosterCard)).toHaveLength(2);
    });
  });

  it('shows the designed no-matches state instead of an empty list', async () => {
    mockApiServer.use(
      http.get('*/teams/:teamId/rosters', () =>
        HttpResponse.json({ items: [], total: 0, limit: 50, offset: 0 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/rosters', '/rosters', <RostersContainer />);

    expect(await screen.findByTestId(TEST_IDS.competitionsEmpty, {}, WAIT)).toBeInTheDocument();
  });

  it('opens the roster a coach picked', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/rosters', '/rosters', <RostersContainer />);

    await screen.findByTestId(TEST_IDS.rostersList, {}, WAIT);
    const open = screen.getAllByTestId(TEST_IDS.rosterOpen);
    fireEvent.click(open[0]!);

    expect(open).toHaveLength(3);
  });
});

describe('roster builder (live endpoints)', () => {
  it('shows the policy facts with an honest minimum and deadline', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    const header = await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    expect(header).toHaveTextContent('12–20 players');
    expect(header).toHaveTextContent('A captain is required');
  });

  it('renders the server-side validation preview with its violations', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterValidationPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.rosterValidationPanel)).toHaveTextContent(
      'Blocked by a constraint',
    );
    expect(screen.getAllByTestId(TEST_IDS.rosterViolation).length).toBe(2);
  });

  it('prints every rostered player, saying so when a value is missing', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterEntriesPanel, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.rosterEntryRow);
    expect(rows).toHaveLength(3);
    expect(screen.getByTestId(TEST_IDS.rosterEntriesPanel)).toHaveTextContent('Unassigned');
    expect(screen.getByTestId(TEST_IDS.rosterEntriesPanel)).toHaveTextContent('Not declared');
  });

  it('keeps the constraint-override provenance visible on the roster', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterEntriesPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.rosterEntriesPanel)).toHaveTextContent(
      'Needed for handler depth',
    );
  });

  it('removes one player from the roster', async () => {
    await removeFirstRosterEntry();

    await waitFor(
      () => {
        expect(screen.getAllByTestId(TEST_IDS.rosterEntryRow)).toHaveLength(2);
      },
      { timeout: 5000 },
    );
  });

  it('offers no remove action to a member without the manage grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterEntriesPanel, {}, WAIT);
    expect(screen.queryAllByTestId(TEST_IDS.rosterEntryRemove)).toHaveLength(0);
  });

  it('withholds publish while the roster fails validation', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    const actions = screen.getAllByTestId(TEST_IDS.rosterAction);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveTextContent('Archive roster');
  });

  it('locks a published roster for a holder of the lock grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoster(MOCK_ROSTERS.matchRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    const lock = screen
      .getAllByTestId(TEST_IDS.rosterAction)
      .find((action) => action.textContent.includes('Lock roster'));
    expect(lock).toBeDefined();
    fireEvent.click(lock!);

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.rosterHeader)).toHaveTextContent('Locked');
      },
      { timeout: 5000 },
    );
  });

  it('offers no lock action to a coach without the lock grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.matchRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    const labels = screen.getAllByTestId(TEST_IDS.rosterAction).map((action) => action.textContent);
    expect(labels.some((label) => label.includes('Lock roster'))).toBe(false);
  });

  it('freezes a locked roster and says why', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoster(MOCK_ROSTERS.lockedRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.rosterDetailView)).toHaveTextContent(
      'This roster is locked',
    );
  });

  it('shows the append-only snapshot history of a locked roster', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoster(MOCK_ROSTERS.lockedRosterId);

    await screen.findByTestId(TEST_IDS.rosterHistoryPanel, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.rosterHistoryRow)).toHaveLength(1);
  });

  it('says a roster with no snapshot yet has none', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterHistoryPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.rosterHistoryPanel)).toHaveTextContent(
      'No snapshot has been taken yet.',
    );
  });

  it('changes nothing when the coach backs out of a lifecycle confirmation', async () => {
    confirmResult.value = false;
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoster(MOCK_ROSTERS.matchRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.rosterAction)[0]!);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.rosterHeader)).toHaveTextContent('Published');
    });
  });

  it('leaves the roster untouched when a lifecycle call is rejected as stale', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/rosters/:rosterId/lock', () =>
        HttpResponse.json({ statusCode: 409, code: 'VERSION_CONFLICT' }, { status: 409 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoster(MOCK_ROSTERS.matchRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    const lock = screen
      .getAllByTestId(TEST_IDS.rosterAction)
      .find((action) => action.textContent.includes('Lock roster'));
    fireEvent.click(lock!);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.rosterHeader)).toHaveTextContent('Published');
    });
  });

  it('archives a roster through the transition endpoint', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.rosterAction)[0]!);

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.rosterHeader)).toHaveTextContent('Archived');
      },
      { timeout: 5000 },
    );
  });

  it('leaves the entry in place when the removal call fails', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/rosters/:rosterId/entries/:membershipId/removal', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await removeFirstRosterEntry();

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.rosterEntryRow)).toHaveLength(3);
    });
  });

  it('reports a roster that does not exist as not found', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster('11000000-0000-4000-8000-0000000000ff');

    expect(await screen.findByTestId(TEST_IDS.competitionsError, {}, WAIT)).toBeInTheDocument();
  });

  it('walks back to the roster list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoster(MOCK_ROSTERS.competitionRosterId);

    await screen.findByTestId(TEST_IDS.rosterHeader, {}, WAIT);
    fireEvent.click(screen.getByText('Back to rosters'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.rosterHeader)).not.toBeInTheDocument();
    });
  });

  it('waits instead of requesting a roster that was never identified', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/rosters', '/rosters', <RosterDetailContainer />);

    expect(await screen.findByTestId(TEST_IDS.competitionsLoading, {}, WAIT)).toBeInTheDocument();
  });
});

describe('squad publish and lock lifecycle', () => {
  it('publishes a draft squad once the coach confirms', async () => {
    const actions = await openDraftSquad();
    fireEvent.click(actions[0]!);

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.squadHeader)).toHaveTextContent('Published');
      },
      { timeout: 5000 },
    );
  });

  it('offers lock and revise once the squad is published', async () => {
    const actions = await openDraftSquad();
    fireEvent.click(actions[0]!);

    await waitFor(
      () => {
        expect(screen.getAllByTestId(TEST_IDS.squadTransition)).toHaveLength(3);
      },
      { timeout: 5000 },
    );
  });

  it('changes nothing when the coach backs out of the confirmation', async () => {
    confirmResult.value = false;
    const actions = await openDraftSquad();
    fireEvent.click(actions[0]!);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadHeader)).toHaveTextContent('Draft');
    });
  });

  it('leaves the squad untouched when the transition is rejected as stale', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/squads/:squadId/transition', () =>
        HttpResponse.json({ statusCode: 409, code: 'VERSION_CONFLICT' }, { status: 409 }),
      ),
    );
    const actions = await openDraftSquad();
    fireEvent.click(actions[0]!);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadHeader)).toHaveTextContent('Draft');
    });
  });
});

describe('tryout member conversion', () => {
  it('converts an accepted candidate once the administrator confirms', async () => {
    await openAcceptedCandidate();
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutConversionConfirm));

    await waitFor(
      () => {
        expect(rowFor(TEST_IDS.tryoutCandidateRow, 'Candidate Three')).toHaveTextContent(
          'Converted to member',
        );
      },
      { timeout: 5000 },
    );
  });

  it('reports a second conversion as already done rather than duplicating', async () => {
    await openAcceptedCandidate();
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutConversionConfirm));
    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.tryoutConversionPanel)).toHaveTextContent(
          'already a member',
        );
      },
      { timeout: 5000 },
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutConversionConfirm)).toBeDisabled();
    });
  });

  it('changes nothing when the administrator backs out', async () => {
    confirmResult.value = false;
    await openAcceptedCandidate();
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutConversionConfirm));

    await waitFor(() => {
      expect(rowFor(TEST_IDS.tryoutCandidateRow, 'Candidate Three')).toHaveTextContent('Accepted');
    });
  });

  it('leaves the candidate unconverted when the call fails', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/tryouts/:tryoutId/candidates/:candidateId/conversion', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await openAcceptedCandidate();
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutConversionConfirm));

    await waitFor(() => {
      expect(rowFor(TEST_IDS.tryoutCandidateRow, 'Candidate Three')).toHaveTextContent('Accepted');
    });
  });
});
