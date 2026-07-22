import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http } from 'msw';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LeaderboardContainer } from '@/modules/points/containers/leaderboard.container';
import { createAppQueryClient } from '@/packages/query';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { failRequest } from '@/tests/msw/mock-request.helper';

import { apiUrl, registerIntegrationSession } from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';

const WAIT = { timeout: 5000 };

/**
 * P0 regression pin (recovery audit P0-5): the HTTP/query layer used to retry
 * deterministic 401/403/404 answers three times, so a Forbidden screen sat in
 * "Loading…" for seconds before telling the truth. These tests run the REAL
 * production query client — not the retry-free test client — to prove the
 * shipped retry policy itself.
 */
function renderLeaderboardWithProductionClient(): void {
  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <MemoryRouter initialEntries={['/leaderboard']}>
        <Route path="/leaderboard">
          <LeaderboardContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

registerIntegrationSession();

describe('deterministic failures are never retried', () => {
  it('renders the designed error state from a 403 after exactly one request', async () => {
    let attempts = 0;
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/points'), () => {
        attempts += 1;
        return failRequest(403, 'FORBIDDEN', '/points');
      }),
    );

    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderLeaderboardWithProductionClient();

    const error = await screen.findByTestId(TEST_IDS.leaderboardError, {}, WAIT);
    expect(error).toHaveTextContent('You do not have permission to do that.');
    expect(attempts).toBe(1);
  });

  it('renders the designed error state from a 404 after exactly one request', async () => {
    let attempts = 0;
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/points'), () => {
        attempts += 1;
        return failRequest(404, 'NOT_FOUND', '/points');
      }),
    );

    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderLeaderboardWithProductionClient();

    await screen.findByTestId(TEST_IDS.leaderboardError, {}, WAIT);
    expect(attempts).toBe(1);
  });
});
