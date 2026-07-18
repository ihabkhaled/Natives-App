import { afterEach, assert, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import { DASHBOARD_API_PATHS } from '../constants/dashboard-api.constants';
import { getDashboardSummary } from './get-dashboard-summary.service';

const SUMMARY_DTO = {
  persona: 'member',
  generatedAt: '2026-07-18T09:00:00.000Z',
  widgets: [
    {
      kind: 'member-standing',
      presentation: 'metric',
      status: 'ready',
      asOf: null,
      metric: { value: null, displayValue: null, unit: 'rank', tone: 'neutral' },
    },
  ],
};

function wireClient(routes: readonly TestRoute[]): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
}

function summaryRoute(status: number, data: unknown): TestRoute {
  return { method: 'GET', url: DASHBOARD_API_PATHS.summary, respond: () => ({ status, data }) };
}

async function summaryFailure(): Promise<AppError> {
  const outcome: unknown = await getDashboardSummary().catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('getDashboardSummary', () => {
  it('maps a summary projection to the domain, preserving null-not-zero', async () => {
    wireClient([summaryRoute(200, SUMMARY_DTO)]);

    const summary = await getDashboardSummary();

    expect(summary.persona).toBe('member');
    expect(summary.widgets).toHaveLength(1);
    const widget = summary.widgets[0];
    assert(widget?.presentation === 'metric');
    expect(widget.metric.value).toBeNull();
  });

  it('maps a 500 to the server code', async () => {
    wireClient([summaryRoute(500, { statusCode: 500 })]);

    expect((await summaryFailure()).code).toBe(APP_ERROR_CODE.Server);
  });

  it('maps a 403 to the forbidden code', async () => {
    wireClient([summaryRoute(403, { statusCode: 403 })]);

    expect((await summaryFailure()).code).toBe(APP_ERROR_CODE.Forbidden);
  });

  it('maps a contract violation to an unexpected AppError', async () => {
    wireClient([summaryRoute(200, { persona: 'ghost', generatedAt: 'x', widgets: 'no' })]);

    expect((await summaryFailure()).code).toBe(APP_ERROR_CODE.Unexpected);
  });

  it('wraps a non-HTTP failure into an unexpected AppError', async () => {
    const failure = await summaryFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
