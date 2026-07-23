import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyAttendanceContainer } from '@/modules/attendance/containers/my-attendance.container';
import { selfCheckIn } from '@/modules/attendance/services/self-check-in.service';
import { createAppQueryClient } from '@/packages/query';
import { TEST_IDS } from '@/shared/config';
import { makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';
import { MOCK_ATTENDANCE, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { findPracticeSession } from '@/tests/msw/practice.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import { apiUrl } from '../setup/integration-api.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };
const NEXT_SESSION_ID = 'sess-throwing';

function renderMyAttendance(useProductionClient = false): void {
  render(
    <QueryClientProvider
      client={useProductionClient ? createAppQueryClient() : createTestQueryClient()}
    >
      <MemoryRouter initialEntries={['/my-attendance']}>
        <Route path="/my-attendance">
          <MyAttendanceContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Anchor the frozen clock a given offset from the next session's start. */
function anchorRelativeToNextSession(offsetMs: number): void {
  const session = findPracticeSession(MOCK_ATTENDANCE.teamId, NEXT_SESSION_ID);
  expect(session).toBeDefined();
  vi.setSystemTime(new Date(Date.parse(session!.startsAt) + offsetMs));
}

/**
 * Count every staff-scoped attendance read. A resolver returning undefined
 * falls through to the regular handler, so this observes without changing
 * behaviour — the privacy pin is that the count stays at ZERO.
 */
function trackStaffReads(): () => number {
  let requests = 0;
  mockApiServer.use(
    http.get(apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance'), () => {
      requests += 1;
      return undefined;
    }),
    http.get(apiUrl('/teams/:teamId/attendance/participation/:membershipId'), () => {
      requests += 1;
      return undefined;
    }),
  );
  return () => requests;
}

// Freeze only Date (real timers stay for waitFor/MSW). The mock sessions are
// generated relative to the real clock at import time, so tests that need a
// specific window position re-anchor with vi.setSystemTime per test.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: Date.now() });
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('member self-attendance (real client + MSW)', () => {
  it('renders participation, server check-in state, and history from self reads only', async () => {
    const staffReads = trackStaffReads();
    // Well before the window: the server rules `not_open` with the open instant.
    anchorRelativeToNextSession(-3 * 60 * 60_000);
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderMyAttendance();

    expect(
      await screen.findByTestId(TEST_IDS.myAttendanceParticipationCard, {}, WAIT),
    ).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.myAttendanceParticipationRate)).toHaveTextContent('90.9%');
    expect(screen.getByTestId(TEST_IDS.myAttendanceRuleNotice)).toHaveTextContent(
      /finalized sessions only/u,
    );
    expect(screen.getByText(/pending approval/u)).toBeVisible();

    // The check-in card renders the SERVER state — no provisional caveat copy.
    expect(
      await screen.findByTestId(TEST_IDS.myAttendanceCheckInState, {}, WAIT),
    ).toHaveTextContent(/Check-in opens/u);
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
    expect(screen.queryByText(/Subject to confirmation/u)).not.toBeInTheDocument();

    // The history section shows the first bounded window of the own record.
    expect(await screen.findByTestId(TEST_IDS.myAttendanceHistorySection, {}, WAIT)).toBeVisible();
    expect(screen.getAllByTestId(TEST_IDS.myAttendanceHistoryRow)).toHaveLength(20);

    // The privacy rule (prompt 240): the member surface never fires a roster
    // or per-member participation read — only self endpoints.
    expect(staffReads()).toBe(0);
  });

  it('checks in inside the server window and renders the recorded ruling', async () => {
    anchorRelativeToNextSession(-30 * 60_000);
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderMyAttendance();

    const button = await screen.findByTestId(TEST_IDS.myAttendanceCheckInButton, {}, WAIT);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInStatus)).toBeVisible();
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInState)).toHaveTextContent(
      'Recorded by you',
    );
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
  });

  it('treats a repeated check-in as a no-op returning the existing record unchanged', async () => {
    anchorRelativeToNextSession(-30 * 60_000);
    await signInAs(MOCK_PERSONA_EMAILS.member);

    const first = await selfCheckIn(MOCK_ATTENDANCE.teamId, NEXT_SESSION_ID, 'warmup done');
    const repeat = await selfCheckIn(MOCK_ATTENDANCE.teamId, NEXT_SESSION_ID, null);

    expect(first.status).toBe('present_on_time');
    expect(first.source).toBe('self');
    expect(repeat.version).toBe(first.version);
    expect(repeat.recordedAtIso).toBe(first.recordedAtIso);
    expect(repeat.checkInAtIso).toBe(first.checkInAtIso);
  });

  it('recovers from a 409 window refusal by refetching the server ruling', async () => {
    anchorRelativeToNextSession(-30 * 60_000);
    // The server story: the window closes between render and submit — the
    // POST refuses with the contract's message key and the refetched own
    // record now rules `closed`.
    let hasRefused = false;
    mockApiServer.use(
      http.post(
        apiUrl(`/teams/:teamId/practice-sessions/${NEXT_SESSION_ID}/attendance/check-in`),
        () => {
          hasRefused = true;
          return HttpResponse.json(
            {
              statusCode: 409,
              code: 'CHECK_IN_WINDOW_CLOSED',
              message: 'Check-in is closed for this session',
              messageKey: 'errors.practices.checkInWindowClosed',
              errors: [],
              path: `/api/v1/teams/${MOCK_ATTENDANCE.teamId}/practice-sessions/${NEXT_SESSION_ID}/attendance/check-in`,
              timestamp: '2026-07-16T12:00:00.000Z',
              requestId: 'mock-window-closed',
            },
            { status: 409 },
          );
        },
      ),
      http.get(apiUrl(`/teams/:teamId/practice-sessions/${NEXT_SESSION_ID}/attendance/me`), () => {
        if (!hasRefused) {
          return undefined;
        }
        return HttpResponse.json(
          makeSelfRecordDto({
            sessionId: NEXT_SESSION_ID,
            selfCheckIn: {
              state: 'closed',
              opensAt: '2026-07-26T14:00:00.000Z',
              closesAt: '2026-07-26T17:00:00.000Z',
            },
          }),
        );
      }),
    );
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderMyAttendance();

    fireEvent.click(await screen.findByTestId(TEST_IDS.myAttendanceCheckInButton, {}, WAIT));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInState)).toHaveTextContent(
        'Check-in closed',
      );
    }, WAIT);
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
  });

  it('pages the history newest-first through load-more up to the full total', async () => {
    anchorRelativeToNextSession(-3 * 60 * 60_000);
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderMyAttendance();

    expect(await screen.findByTestId(TEST_IDS.myAttendanceHistorySection, {}, WAIT)).toBeVisible();
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.myAttendanceHistoryRow)).toHaveLength(20);
    }, WAIT);
    // The fixture's third-newest session is unrecorded on an open sheet —
    // the row says so instead of inventing a zero.
    const rows = screen.getAllByTestId(TEST_IDS.myAttendanceHistoryRow);
    expect(rows[2]).toHaveTextContent('Not recorded');
    expect(rows[2]).toHaveTextContent('Not finalized yet');

    fireEvent.click(screen.getByTestId(TEST_IDS.myAttendanceHistoryLoadMore));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.myAttendanceHistoryRow)).toHaveLength(25);
    }, WAIT);
    // All 25 rows are shown: nothing more to load.
    expect(screen.queryByTestId(TEST_IDS.myAttendanceHistoryLoadMore)).not.toBeInTheDocument();
  });

  it('answers an analyst deep link with the honest forbidden state after exactly one request', async () => {
    let participationRequests = 0;
    mockApiServer.use(
      http.get(apiUrl(`/teams/${MOCK_ATTENDANCE.teamId}/attendance/me/participation`), () => {
        participationRequests += 1;
        return undefined;
      }),
    );

    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    renderMyAttendance(true);

    expect(await screen.findByTestId(TEST_IDS.myAttendanceForbidden, {}, WAIT)).toBeVisible();
    expect(participationRequests).toBe(1);
    expect(screen.queryByTestId(TEST_IDS.myAttendanceParticipationCard)).not.toBeInTheDocument();
  });
});
