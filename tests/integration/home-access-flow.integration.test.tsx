import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { buildAuthUser } from '@/modules/auth';
import { HomeContainer } from '@/modules/home/containers/home.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { apiUrl, registerIntegrationSession } from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderHome(): void {
  renderRoute(APP_PATHS.home, APP_PATHS.home, <HomeContainer />);
}

registerIntegrationSession();

describe('a session without team access sees the designed notice, not a bare shell', () => {
  // Recovery audit: an invitation-created user ends up with no membership and
  // no team-scoped grants, and the shell used to collapse silently to
  // Home/Notifications/Settings with nothing explaining why.
  it('states "no team access yet" for a session with no team membership', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.noTeam);
    renderHome();

    const notice = await screen.findByTestId(TEST_IDS.homeNoAccessNotice, {}, WAIT);
    expect(notice).toHaveTextContent('No team access yet');
    expect(notice).toHaveTextContent('Ask a team administrator');
  });

  it('states the notice when the scoped permissions come back EMPTY', async () => {
    mockApiServer.use(
      http.get(apiUrl('/auth/me'), () => HttpResponse.json(buildAuthUser({ permissions: [] }))),
      http.get(apiUrl('/rbac/me/permissions'), () => HttpResponse.json({ permissions: [] })),
    );
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderHome();

    expect(await screen.findByTestId(TEST_IDS.homeNoAccessNotice, {}, WAIT)).toHaveTextContent(
      'No team access yet',
    );
  });

  it('never shows the notice to a member with scoped grants', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderHome();

    await screen.findByTestId(TEST_IDS.homePage, {}, WAIT);
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.homeGreeting)).toBeInTheDocument();
    }, WAIT);
    expect(screen.queryByTestId(TEST_IDS.homeNoAccessNotice)).not.toBeInTheDocument();
  });
});
