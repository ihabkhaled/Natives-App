import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { StandingsContainer } from '@/modules/standings/containers/standings.container';
import { StandingsRulesContainer } from '@/modules/standings/containers/standings-rules.container';
import { TeamHistoryContainer } from '@/modules/standings/containers/team-history.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

function renderAt(path: string, pattern: string, node: React.JSX.Element): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Route path={pattern}>{node}</Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('standings flow (real client + MSW)', () => {
  it('renders the standings as a real table citing its rule version', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAt('/standings', '/standings', <StandingsContainer />);

    await screen.findByTestId(TEST_IDS.standingsTable, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.standingsRow).length).toBeGreaterThan(0);
    expect(screen.getByTestId(TEST_IDS.standingsRuleFooter)).toHaveTextContent('v');
    expect(screen.getByRole('columnheader', { name: 'Entrant' })).toBeInTheDocument();
  });

  it('gives a coach the recompute and manual affordances', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAt('/standings', '/standings', <StandingsContainer />);

    await screen.findByTestId(TEST_IDS.standingsTable, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.standingsRecomputeOpen)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.standingsManualOpen)).toBeInTheDocument();
  });

  it('hides the manage affordances from a read-only member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/standings', '/standings', <StandingsContainer />);

    await screen.findByTestId(TEST_IDS.standingsTable, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.standingsRecomputeOpen)).not.toBeInTheDocument();
  });

  it('states the immutable-versions invariant on the rules screen', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAt('/standings/rules', '/standings/rules', <StandingsRulesContainer />);

    await screen.findByTestId(TEST_IDS.standingsRulesList, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.standingsRulesView)).toHaveTextContent('never edited');
  });

  it('shows the trophy cabinet grouped by season to a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/team-history', '/team-history', <TeamHistoryContainer />);

    await screen.findByTestId(TEST_IDS.teamHistoryTimeline, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.teamHistoryEntry).length).toBeGreaterThan(0);
  });
});
