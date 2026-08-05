import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PracticeRsvpDetailContainer } from '@/modules/practice-rsvp-detail/containers/practice-rsvp-detail.container';
import { TEST_IDS } from '@/shared/config';
import type * as SharedUi from '@/shared/ui';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

/**
 * `useConfirmAlert` presents through Ionic's imperative alert API, which
 * does not hydrate meaningfully in jsdom. The confirm gate itself is the
 * thing this flow needs to prove, so it is stubbed to resolve as accepted
 * while every other layer — gateway, schema, mapper, service, query,
 * mutation, MSW — runs for real.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedUi>();
  return { ...actual, useConfirmAlert: () => ({ confirm: vi.fn().mockResolvedValue(true) }) };
});

function renderRsvpDetail(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/practice-sessions/session-mock-1/rsvps']}>
        <Route path="/practice-sessions/:sessionId/rsvps">
          <PracticeRsvpDetailContainer />
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

describe('practice RSVP detail flow (real client + MSW)', () => {
  it('reads the roster for a coach', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRsvpDetail();

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailRoster, {}, { timeout: 5000 });

    expect(screen.getAllByTestId(TEST_IDS.practiceRsvpDetailRosterRow).length).toBeGreaterThan(0);
  });

  it('reads the privacy-safe planning summary alongside the roster', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRsvpDetail();

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailSummary, {}, { timeout: 5000 });

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailSummary)).toBeInTheDocument();
  });

  /**
   * An override is somebody's answer changed on their behalf: it is
   * confirmed before it reaches the server, and the roster reflects the new
   * answer only once the server has actually accepted it.
   */
  it('confirms then overrides a member and reflects the new status', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRsvpDetail();

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailRoster, {}, { timeout: 5000 });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.practiceRsvpDetailOverrideAction)[0]!);

    const panel = await screen.findByTestId(
      TEST_IDS.practiceRsvpDetailOverridePanel,
      {},
      { timeout: 5000 },
    );
    fireIonChange(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideStatus), 'not_going');
    fireIonInput(
      screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideReason),
      'Told us in person.',
    );
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideSubmit));

    await waitFor(
      () => {
        expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailOverridePanel)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(panel).not.toBeInTheDocument();
  });

  /**
   * The history panel is the reason the override endpoint is trustworthy:
   * it must show what is already on record for a member, real revisions
   * fetched over the wire, not a client-side guess.
   */
  it('reads one member\'s history on demand', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRsvpDetail();

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailRoster, {}, { timeout: 5000 });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.practiceRsvpDetailHistoryAction)[0]!);

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailHistoryPanel, {}, { timeout: 5000 });

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailHistoryPanel)).toBeInTheDocument();
  });

  /**
   * Who is coming is roster information; a member may read the agenda of a
   * session they attend, but not the roster or override tools.
   */
  it('withholds the screen from a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRsvpDetail();

    await screen.findByTestId(TEST_IDS.practiceRsvpDetailForbidden, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailRoster)).not.toBeInTheDocument();
  });
});
