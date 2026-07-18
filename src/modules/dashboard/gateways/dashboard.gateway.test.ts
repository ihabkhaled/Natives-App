import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { DASHBOARD_API_PATHS } from '../constants/dashboard-api.constants';
import { requestDashboardSummary } from './dashboard.gateway';

const SUMMARY_DTO = {
  persona: 'member',
  generatedAt: '2026-07-18T09:00:00.000Z',
  widgets: [],
};

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestDashboardSummary', () => {
  it('gets the summary endpoint and returns the parsed payload', async () => {
    installTestAppHttpClient([
      {
        method: 'GET',
        url: DASHBOARD_API_PATHS.summary,
        respond: () => ({ status: 200, data: SUMMARY_DTO }),
      },
    ]);

    await expect(requestDashboardSummary()).resolves.toEqual(SUMMARY_DTO);
  });

  it('attaches the bearer token: the summary is a protected read', async () => {
    let seenHeaders: Record<string, unknown> = {};
    installTestAppHttpClient([
      {
        method: 'GET',
        url: DASHBOARD_API_PATHS.summary,
        respond: (config) => {
          seenHeaders = config.headers;
          return { status: 200, data: SUMMARY_DTO };
        },
      },
    ]);

    await requestDashboardSummary();

    expect(seenHeaders['Authorization']).toBeDefined();
  });

  it('rejects a payload that violates the wire contract', async () => {
    installTestAppHttpClient([
      {
        method: 'GET',
        url: DASHBOARD_API_PATHS.summary,
        respond: () => ({
          status: 200,
          data: { persona: 'nobody', generatedAt: 'x', widgets: 'no' },
        }),
      },
    ]);

    await expect(requestDashboardSummary()).rejects.toThrow();
  });
});
