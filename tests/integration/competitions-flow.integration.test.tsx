import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CompetitionDetailContainer } from '@/modules/competitions/containers/competition-detail.container';
import { CompetitionsContainer } from '@/modules/competitions/containers/competitions.container';
import { SquadsContainer } from '@/modules/competitions/containers/squads.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_COMPETITIONS } from '@/tests/msw/competitions.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { PERSONA_USERS } from '@/tests/msw/personas.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };
const UNGRANTED_USER = PERSONA_USERS[MOCK_PERSONA_EMAILS.member]!;

function renderList(): void {
  renderRoute('/competitions', '/competitions', <CompetitionsContainer />);
}

function renderDetail(competitionId: string): void {
  renderRoute(
    `/competitions/${competitionId}`,
    '/competitions/:competitionId',
    <CompetitionDetailContainer />,
  );
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('competition list (real client + MSW)', () => {
  it('lists the team competitions with their format and state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.competitionCard)).toHaveLength(3);
    expect(screen.getByText('Cairo Ultimate League')).toBeInTheDocument();
  });

  it('says the dates are unpublished instead of rendering an empty range', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    expect(screen.getByText(/Dates not published yet/u)).toBeInTheDocument();
  });

  it('narrows the list to a single status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.competitionsStatusFilter), 'draft');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.competitionCard)).toHaveLength(1);
    });
  });

  it('narrows the list to a single format', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.competitionsTypeFilter), 'friendly');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.competitionCard)).toHaveLength(1);
    });
  });

  it('shows a designed no-matches state rather than an empty page', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.competitionsStatusFilter), 'archived');

    await waitFor(() => {
      expect(screen.getByText('No competitions match these filters')).toBeInTheDocument();
    });
  });

  it('blocks the screen for a principal without the competition read grant', async () => {
    mockApiServer.use(
      http.get('*/auth/me', () =>
        HttpResponse.json({
          ...UNGRANTED_USER,
          permissions: UNGRANTED_USER.permissions.filter(
            (permission) => !permission.startsWith('competition.'),
          ),
        }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    expect(await screen.findByTestId(TEST_IDS.competitionsForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('opens the competition the member picked', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    const open = screen.getAllByTestId(TEST_IDS.competitionOpen);
    fireEvent.click(open[0]!);

    expect(open.length).toBeGreaterThan(0);
  });

  it('offers a direct route to the season squads', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.competitionsList, {}, WAIT);
    fireEvent.click(screen.getByText('Open season squads'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.competitionsList)).not.toBeInTheDocument();
    });
  });

  it('renders the error state when the list request fails', async () => {
    mockApiServer.use(
      http.get('*/teams/:teamId/competitions', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    expect(await screen.findByTestId(TEST_IDS.competitionsError, {}, WAIT)).toBeInTheDocument();
  });
});

describe('competition detail (real client + MSW)', () => {
  it('shows the published stages with their rounds in playing order', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.leagueId);

    await screen.findByTestId(TEST_IDS.competitionStages, {}, WAIT);
    const stages = screen.getAllByTestId(TEST_IDS.competitionStage);
    expect(stages[0]).toHaveTextContent('Group stage');
    expect(screen.getAllByTestId(TEST_IDS.competitionRound)).toHaveLength(2);
  });

  it('shows fixtures with their reschedule provenance and unassigned venue', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.leagueId);

    await screen.findByTestId(TEST_IDS.competitionFixtures, {}, WAIT);
    const fixtures = screen.getAllByTestId(TEST_IDS.competitionFixture);
    expect(fixtures).toHaveLength(2);
    expect(fixtures[1]).toHaveTextContent('Opponent travel delay');
    expect(fixtures[1]).toHaveTextContent('Venue not assigned');
  });

  it('resolves each fixture opponent by name', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.leagueId);

    await screen.findByTestId(TEST_IDS.competitionFixtures, {}, WAIT);
    expect(screen.getAllByText('Nile Nomads').length).toBeGreaterThan(0);
  });

  it('lists the opponent directory without any contact detail', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.leagueId);

    const directory = await screen.findByTestId(TEST_IDS.competitionOpponents, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.competitionOpponent)).toHaveLength(3);
    expect(directory.textContent).not.toContain('@');
  });

  it('surfaces the cancellation reason on a cancelled competition', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.cancelledId);

    await screen.findByTestId(TEST_IDS.competitionSummary, {}, WAIT);
    expect(screen.getByText(/Venue withdrew the pitch booking/u)).toBeInTheDocument();
  });

  it('says a competition with no structure has none rather than rendering nothing', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.championshipId);

    await screen.findByTestId(TEST_IDS.competitionSummary, {}, WAIT);
    expect(screen.getByText(/No stages have been published/u)).toBeInTheDocument();
    expect(screen.getByText(/No fixtures have been scheduled/u)).toBeInTheDocument();
  });

  it('reports a competition that does not exist as not found', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail('60000000-0000-4000-8000-0000000000ff');

    expect(await screen.findByTestId(TEST_IDS.competitionsError, {}, WAIT)).toBeInTheDocument();
  });

  it('walks back to the list from a competition', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_COMPETITIONS.leagueId);

    await screen.findByTestId(TEST_IDS.competitionSummary, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.competitionBack));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.competitionSummary)).not.toBeInTheDocument();
    });
  });
});

describe('squad list (real client + MSW)', () => {
  it('lists the season squads with their lifecycle state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/squads', '/squads', <SquadsContainer />);

    await screen.findByTestId(TEST_IDS.squadsList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.squadCard)).toHaveLength(3);
    expect(screen.getByText('Championship squad')).toBeInTheDocument();
  });

  it('narrows the squad list to a single status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/squads', '/squads', <SquadsContainer />);

    await screen.findByTestId(TEST_IDS.squadsList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.squadsStatusFilter), 'locked');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.squadCard)).toHaveLength(1);
    });
  });

  it('says there is no deadline instead of printing an empty date', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/squads', '/squads', <SquadsContainer />);

    await screen.findByTestId(TEST_IDS.squadsList, {}, WAIT);
    expect(screen.getByText('No deadline set')).toBeInTheDocument();
  });

  it('opens the squad the coach picked', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/squads', '/squads', <SquadsContainer />);

    await screen.findByTestId(TEST_IDS.squadsList, {}, WAIT);
    const open = screen.getAllByTestId(TEST_IDS.squadOpen);
    fireEvent.click(open[0]!);

    expect(open.length).toBe(3);
  });
});

describe('a detail screen opened without its route parameter', () => {
  it('waits instead of requesting a competition that was never identified', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute('/competitions', '/competitions', <CompetitionDetailContainer />);

    expect(await screen.findByTestId(TEST_IDS.competitionsLoading, {}, WAIT)).toBeInTheDocument();
  });
});
