import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach } from 'vitest';

import { getEnvironment } from '@/packages/environment';

import { initTestI18n } from './i18n-test.helper';
import { clearSessionAfterTest, resetSessionForTest } from './integration-session.helper';
import { mockApiServer } from './msw-server.setup';

/** Absolute mock-mode API URL for a path (shared by integration tests). */
export function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

/**
 * The per-test lifecycle every screen integration test shares: a fresh i18n
 * catalog, a fresh HTTP client, and an anonymous session either side.
 */
export function registerIntegrationSession(): void {
  beforeEach(async () => {
    await initTestI18n();
    await resetSessionForTest();
  });

  afterEach(async () => {
    await clearSessionAfterTest();
  });
}

/** How many times the failing read was issued, either side of the retry. */
export interface RetryAttempts {
  readonly before: number;
  readonly after: number;
}

interface RetryExpectation {
  /** The MSW path pattern to fail, relative to the API base URL. */
  readonly path: string;
  readonly errorTestId: string;
  readonly signIn: () => Promise<void>;
  readonly render: () => void;
}

/**
 * Drive the shared "a failed read offers a retry" flow: stub the read as a
 * server error, render, then activate the designed error state's retry. The
 * caller asserts on the returned attempt counts, so the expectation stays
 * visible at the test that owns it.
 */
export async function retryFromErrorState(options: RetryExpectation): Promise<RetryAttempts> {
  let attempts = 0;
  mockApiServer.use(
    http.get(apiUrl(options.path), () => {
      attempts += 1;
      return HttpResponse.json({ bad: true }, { status: 500 });
    }),
  );

  await options.signIn();
  options.render();

  const error = await screen.findByTestId(options.errorTestId, {}, { timeout: 5000 });
  const before = attempts;
  fireEvent.click(within(error).getByText('Try again'));
  await waitFor(
    () => {
      if (attempts === before) {
        throw new Error('retry has not been issued yet');
      }
    },
    { timeout: 5000 },
  );

  return { before, after: attempts };
}
