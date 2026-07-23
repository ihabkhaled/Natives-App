import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyAttendanceContainer } from '@/modules/attendance/containers/my-attendance.container';
import { createAppQueryClient } from '@/packages/query';
import { TEST_IDS } from '@/shared/config';
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
  it('renders the participation summary and check-in card from self reads only', async () => {
    const staffReads = trackStaffReads();
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

    // The privacy rule (prompt 240): the member surface never fires a roster
    // or per-member participation read — only self endpoints.
    expect(staffReads()).toBe(0);
  });

  it('checks in inside the provisional window and stays recorded on repeat', async () => {
    // Anchor the clock 30 minutes before the earliest upcoming session so the
    // provisional window [startsAt − 60m, end] is open.
    const session = findPracticeSession(MOCK_ATTENDANCE.teamId, 'sess-throwing');
    expect(session).toBeDefined();
    vi.setSystemTime(new Date(Date.parse(session!.startsAt) - 30 * 60_000));

    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderMyAttendance();

    const button = await screen.findByTestId(TEST_IDS.myAttendanceCheckInButton, {}, WAIT);
    expect(screen.getByText(/Subject to confirmation/u)).toBeVisible();
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInStatus)).toBeVisible();
    }, WAIT);
    expect(screen.getByText('Recorded by you')).toBeVisible();
    expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInButton)).not.toBeInTheDocument();
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
