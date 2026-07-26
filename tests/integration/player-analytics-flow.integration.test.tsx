import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PlayerAnalyticsContainer } from '@/modules/analytics/containers/player-analytics.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_ANALYTICS } from '@/tests/msw/analytics.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

function renderPlayer(membershipId: string): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/analytics/players/${membershipId}`]}>
        <Route path="/analytics/players/:membershipId">
          <PlayerAnalyticsContainer />
        </Route>
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

describe('player analytics flow (real client + MSW)', () => {
  it('lets a coach read any player’s series (analytics.read.team)', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPlayer(MOCK_ANALYTICS.memberId);

    await screen.findByTestId(TEST_IDS.analyticsSeriesChart, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.playerAnalyticsView)).toBeInTheDocument();
  });

  it('lets a member read their own series (analytics.read.self, B3)', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPlayer(MOCK_ANALYTICS.ownMemberId);

    const chart = await screen.findByTestId(TEST_IDS.analyticsSeriesChart, {}, WAIT);
    expect(chart).toBeInTheDocument();
  });

  it('forbids a member reading another player’s series', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPlayer(MOCK_ANALYTICS.memberId);

    await screen.findByTestId(TEST_IDS.playerAnalyticsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.analyticsSeriesChart)).not.toBeInTheDocument();
  });

  it('shows the not-found panel for an unknown membership, never a blank chart', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPlayer(MOCK_ANALYTICS.unknownMemberId);

    await screen.findByText('Player not found', {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.analyticsSeriesChart)).not.toBeInTheDocument();
  });
});
