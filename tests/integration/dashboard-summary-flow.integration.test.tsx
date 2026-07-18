import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DashboardContainer } from '@/modules/dashboard';
import { getEnvironment } from '@/packages/environment';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderWithProviders } from '../setup/render-with-providers.helper';

const RAW_BACKEND_MESSAGE = 'raw upstream stacktrace at /var/app/server.js:42';

function widgetTestId(kind: string): string {
  return `${TEST_IDS.dashboardWidget}-${kind}`;
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('dashboard summary flow (real client + MSW)', () => {
  it('renders the member persona dashboard and hides administrator widgets', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);

    renderWithProviders(<DashboardContainer />);

    await waitFor(
      () => {
        expect(screen.getByTestId(widgetTestId('member-attendance'))).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByRole('heading', { name: 'Your dashboard' })).toBeInTheDocument();
    expect(screen.queryByTestId(widgetTestId('admin-lifecycle'))).not.toBeInTheDocument();
  });

  it('renders the administrator persona dashboard and hides member-only widgets', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);

    renderWithProviders(<DashboardContainer />);

    await waitFor(
      () => {
        expect(screen.getByTestId(widgetTestId('admin-lifecycle'))).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.queryByTestId(widgetTestId('member-schedule'))).not.toBeInTheDocument();
  });

  it('renders sanitized copy and never leaks the backend message on failure', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    mockApiServer.use(
      http.get(`${getEnvironment().apiBaseUrl}/dashboard/summary`, () =>
        HttpResponse.json(
          {
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: RAW_BACKEND_MESSAGE,
            path: '/api/v1/dashboard/summary',
            timestamp: '2026-07-16T12:00:00.000Z',
            requestId: 'req-dashboard-failure',
          },
          { status: 500 },
        ),
      ),
    );

    renderWithProviders(<DashboardContainer />);

    const errorState = await screen.findByTestId(TEST_IDS.dashboardError, {}, { timeout: 5000 });
    expect(errorState).toHaveTextContent('Something went wrong on our side.');
    expect(errorState).not.toHaveTextContent(RAW_BACKEND_MESSAGE);
    expect(document.body.textContent).not.toContain(RAW_BACKEND_MESSAGE);
  });
});
