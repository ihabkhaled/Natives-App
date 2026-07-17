import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { HealthCardContainer } from '@/modules/health';
import { getEnvironment } from '@/packages/environment';
import {
  configureAppHttpClient,
  createHttpClient,
  resetAppHttpClientForTesting,
} from '@/packages/http';
import { TEST_IDS } from '@/shared/config';

import { createMemoryTokenStore } from '../factories/http.factory';
import { initTestI18n } from '../setup/i18n-test.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderWithProviders } from '../setup/render-with-providers.helper';

const RAW_BACKEND_MESSAGE = 'raw upstream stacktrace at /var/app/server.js:42';

function failHealthWith(status: number, code: string): void {
  mockApiServer.use(
    http.get(`${getEnvironment().apiBaseUrl}/health`, () =>
      HttpResponse.json(
        {
          statusCode: status,
          code,
          message: RAW_BACKEND_MESSAGE,
          path: '/api/v1/health',
          timestamp: '2026-07-16T12:00:00.000Z',
          requestId: 'req-health-failure',
        },
        { status },
      ),
    ),
  );
}

describe('health card failure rendering (real client + MSW)', () => {
  beforeEach(async () => {
    await initTestI18n();
    resetAppHttpClientForTesting();
    configureAppHttpClient(
      createHttpClient({
        config: { baseUrl: getEnvironment().apiBaseUrl, timeoutMs: 2000 },
        tokenStore: createMemoryTokenStore(null),
      }),
    );
  });

  it('renders sanitized copy and never leaks the backend message on a server error', async () => {
    failHealthWith(500, 'INTERNAL_ERROR');

    renderWithProviders(<HealthCardContainer />);

    const errorState = await screen.findByTestId(TEST_IDS.errorState, {}, { timeout: 5000 });
    expect(errorState).toHaveTextContent('Something went wrong on our side.');
    expect(errorState).not.toHaveTextContent(RAW_BACKEND_MESSAGE);
    expect(document.body.textContent).not.toContain(RAW_BACKEND_MESSAGE);
  });

  it('maps a rate-limited backend to its own translated copy', async () => {
    failHealthWith(429, 'RATE_LIMITED');

    renderWithProviders(<HealthCardContainer />);

    const errorState = await screen.findByTestId(TEST_IDS.errorState, {}, { timeout: 5000 });
    expect(errorState).toHaveTextContent('Too many attempts.');
  });

  it('recovers to the operational state when retried after the backend heals', async () => {
    failHealthWith(500, 'INTERNAL_ERROR');
    renderWithProviders(<HealthCardContainer />);
    const errorState = await screen.findByTestId(TEST_IDS.errorState, {}, { timeout: 5000 });

    mockApiServer.resetHandlers();
    await userEvent.click(await screen.findByText('Try again'));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.healthStatus)).toHaveTextContent('Operational');
    });
    expect(errorState).not.toBeInTheDocument();
  });
});
