import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SESSION_STATUS } from '@/modules/auth';
import { useSessionStore } from '@/modules/auth/store/session.store';
import { AppRouter } from '@/app/router/app-router.routes';
import { APP_PATHS, TEST_IDS } from '@/shared/config';

import { registerIntegrationSession } from '../setup/integration-api.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';
import { QueryClientProvider } from '@tanstack/react-query';

const WAIT = { timeout: 5000 };
const UNKNOWN_PATH = '/definitely-not-a-route';

/** IonReactRouter owns its own browser history, so drive the real URL. */
function renderAt(path: string): void {
  window.history.pushState({}, '', path);
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AppRouter />
    </QueryClientProvider>,
  );
}

function beAnonymous(): void {
  useSessionStore.setState({ status: SESSION_STATUS.Anonymous });
}

registerIntegrationSession();

/**
 * The public navbar and footer are router-level chrome: they are composed
 * once around the whole outlet and gated only by session resolution. These
 * cases pin that down for the three signed-out screens a prior increment
 * flagged as possibly uncovered — the invitation, tryout-registration, and
 * 404 routes — so nobody has to re-derive it from the CSS insets.
 */
describe('public shell on every signed-out route', () => {
  it.each([
    ['the invitation screen', APP_PATHS.acceptInvitation],
    ['the public tryout registration screen', APP_PATHS.tryoutRegistration],
    ['the 404 fallback', UNKNOWN_PATH],
    ['the welcome screen', APP_PATHS.welcome],
    ['the contact screen', APP_PATHS.contact],
  ])('wraps %s in the public navbar and footer', async (_label, path) => {
    beAnonymous();
    renderAt(path);

    expect(await screen.findByTestId(TEST_IDS.publicFooter, {}, WAIT)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.publicNav)).toBeInTheDocument();
  });

  it('hands the footer its full destination list on the 404 fallback', async () => {
    beAnonymous();
    renderAt(UNKNOWN_PATH);

    const footer = await screen.findByTestId(TEST_IDS.publicFooter, {}, WAIT);
    for (const key of ['home', 'about', 'tryouts', 'contact']) {
      expect(screen.getByTestId(`${TEST_IDS.publicFooterLink}-${key}`)).toBeInTheDocument();
    }
    expect(footer).toHaveAttribute('aria-label');
  });

  it('keeps the public shell off an unresolved session, so nothing flashes', () => {
    useSessionStore.setState({ status: SESSION_STATUS.Unknown });
    renderAt(APP_PATHS.tryoutRegistration);

    expect(screen.queryByTestId(TEST_IDS.publicFooter)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.publicNav)).not.toBeInTheDocument();
  });
});
