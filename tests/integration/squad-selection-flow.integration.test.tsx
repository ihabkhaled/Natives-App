import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SquadDetailContainer } from '@/modules/competitions/containers/squad-detail.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_SQUADS } from '@/tests/msw/squads.fixture';

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

function renderSquad(squadId: string): void {
  renderRoute(`/squads/${squadId}`, '/squads/:squadId', <SquadDetailContainer />);
}

/** The eligibility row for one candidate, found by the name it renders. */
function rowFor(name: string): HTMLElement {
  const rows = screen.getAllByTestId(TEST_IDS.squadEligibilityRow);
  const match = rows.find((row) => row.textContent.includes(name));
  expect(match).toBeDefined();
  return match!;
}

/** Open the squad and select the policy-clean candidate. */
async function selectCleanCandidate(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.coach);
  renderSquad(MOCK_SQUADS.draftId);
  await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
  fireEvent.click(within(rowFor('Omar Hassan')).getByTestId(TEST_IDS.squadSelectAction));
}

/** Open the override panel for the candidate the policy flagged. */
async function openOverridePanel(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderSquad(MOCK_SQUADS.draftId);
  await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
  fireEvent.click(within(rowFor('Youssef Adel')).getByTestId(TEST_IDS.squadSelectAction));
  await screen.findByTestId(TEST_IDS.squadOverridePanel, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('squad eligibility is advisory, never an exclusion', () => {
  it('states plainly that the signals do not exclude anyone', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    const advisory = await screen.findByTestId(TEST_IDS.squadEligibilityAdvisory, {}, WAIT);
    expect(advisory).toHaveTextContent('never an automatic exclusion');
  });

  it('lists every candidate, including the ones the policy flagged', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.squadEligibilityRow)).toHaveLength(5);
    expect(screen.getByText('Youssef Adel')).toBeInTheDocument();
  });

  it('renders a null attendance as "not enough data", never as 0%', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    const row = rowFor('Nour Kamal');

    expect(row).toHaveTextContent('Not enough data');
    expect(row.textContent).not.toMatch(/\b0%/u);
  });

  it('shows one advisory chip per signal', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    expect(
      within(rowFor('Omar Hassan')).getAllByTestId(TEST_IDS.squadEligibilitySignal),
    ).toHaveLength(6);
  });

  it('keeps a failed candidate selectable and warns that it records an override', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    const row = rowFor('Youssef Adel');

    expect(row).toHaveTextContent('records a coach override');
    expect(within(row).getByTestId(TEST_IDS.squadSelectAction)).not.toBeDisabled();
  });
});

describe('the coach override requires a reason', () => {
  it('opens the override panel instead of selecting a flagged player outright', async () => {
    await openOverridePanel();

    expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).toBeDisabled();
  });

  it('refuses to confirm until the reason is long enough', async () => {
    await openOverridePanel();

    fireIonInput(screen.getByTestId(TEST_IDS.squadOverrideReason), 'no');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).toBeDisabled();
    });
    expect(screen.getByTestId(TEST_IDS.squadOverridePanel)).toHaveTextContent(
      'at least 5 characters',
    );
  });

  it('records the override once a reason is given', async () => {
    await openOverridePanel();

    fireIonInput(
      screen.getByTestId(TEST_IDS.squadOverrideReason),
      'Needed for handler depth on the road.',
    );
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadOverrideConfirm)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.squadOverrideConfirm));

    await waitFor(
      () => {
        expect(screen.queryByTestId(TEST_IDS.squadOverridePanel)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(rowFor('Youssef Adel')).toHaveTextContent('Overridden by coach');
  });

  it('closes the override panel when the coach backs out', async () => {
    await openOverridePanel();
    fireEvent.click(screen.getByTestId(TEST_IDS.squadOverrideCancel));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.squadOverridePanel)).not.toBeInTheDocument();
    });
  });

  it('disables the flagged pick, with an explanation, without the override grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    const row = rowFor('Youssef Adel');

    expect(within(row).getByTestId(TEST_IDS.squadSelectAction)).toBeDisabled();
    expect(row).toHaveTextContent('do not hold the override grant');
  });
});

describe('plain selection, removal, and the locked squad', () => {
  it('selects a policy-clean candidate without any override', async () => {
    await selectCleanCandidate();

    await waitFor(
      () => {
        expect(within(rowFor('Omar Hassan')).getByTestId(TEST_IDS.squadRemoveAction)).toBeVisible();
      },
      { timeout: 5000 },
    );
    expect(screen.queryByTestId(TEST_IDS.squadOverridePanel)).not.toBeInTheDocument();
  });

  it('removes a selected player again', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    fireEvent.click(within(rowFor('Mariam Zaki')).getByTestId(TEST_IDS.squadRemoveAction));

    await waitFor(
      () => {
        expect(within(rowFor('Mariam Zaki')).getByTestId(TEST_IDS.squadSelectAction)).toBeVisible();
      },
      { timeout: 5000 },
    );
  });

  it('freezes selection on a locked squad and says why', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.lockedId);

    await screen.findByTestId(TEST_IDS.squadEligibilityPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.squadEligibilityPanel)).toHaveTextContent(
      'This squad is locked',
    );
    expect(within(rowFor('Omar Hassan')).getByTestId(TEST_IDS.squadSelectAction)).toBeDisabled();
  });

  it('keeps the squad unchanged when a selection call fails', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/squads/:squadId/selections', () =>
        HttpResponse.json({ statusCode: 409, code: 'CONFLICT' }, { status: 409 }),
      ),
    );
    await selectCleanCandidate();

    await waitFor(() => {
      expect(within(rowFor('Omar Hassan')).getByTestId(TEST_IDS.squadSelectAction)).toBeVisible();
    });
  });
});

describe('a squad workspace opened without its route parameter', () => {
  it('waits instead of requesting a squad that was never identified', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/squads', '/squads', <SquadDetailContainer />);

    expect(await screen.findByTestId(TEST_IDS.competitionsLoading, {}, WAIT)).toBeInTheDocument();
  });
});

describe('availability, roster preview, and lifecycle', () => {
  it('declares availability for the caller and lists what is recorded', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadAvailabilityPanel, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.squadAvailabilitySelect), 'tentative');
    fireIonInput(screen.getByTestId(TEST_IDS.squadAvailabilityReason), 'Might be travelling.');
    fireEvent.click(screen.getByTestId(TEST_IDS.squadAvailabilitySubmit));

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.squadAvailabilityPanel)).toHaveTextContent('Tentative');
      },
      { timeout: 5000 },
    );
  });

  it('says the availability window is closed on a locked squad', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.lockedId);

    await screen.findByTestId(TEST_IDS.squadAvailabilityPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.squadAvailabilityPanel)).toHaveTextContent(
      'selection deadline has passed',
    );
  });

  it('prints the complete roster preview with its backend-pending notice', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadRosterPanel, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.squadRosterPendingNotice)).toHaveTextContent(
      'live on the roster screens',
    );
    expect(screen.getAllByTestId(TEST_IDS.squadRosterRow)).toHaveLength(1);
  });

  it('offers publish and archive on a draft squad to a manager', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadHeader, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.squadTransition)).toHaveLength(2);
  });

  it('offers no lifecycle action to a member without the manage grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadHeader, {}, WAIT);
    expect(screen.queryAllByTestId(TEST_IDS.squadTransition)).toHaveLength(0);
  });

  it('walks back to the squad list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadHeader, {}, WAIT);
    fireEvent.click(screen.getByText('Back to squads'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.squadHeader)).not.toBeInTheDocument();
    });
  });

  it('keeps availability unchanged when the declaration fails', async () => {
    mockApiServer.use(
      http.post('*/teams/:teamId/squads/:squadId/availability', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad(MOCK_SQUADS.draftId);

    await screen.findByTestId(TEST_IDS.squadAvailabilityPanel, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.squadAvailabilitySubmit));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.squadAvailabilitySubmit)).toBeInTheDocument();
    });
  });

  it('reports a squad that does not exist as not found', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderSquad('b0000000-0000-4000-8000-0000000000ff');

    expect(await screen.findByTestId(TEST_IDS.competitionsError, {}, WAIT)).toBeInTheDocument();
  });
});
