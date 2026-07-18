import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AttendanceContainer } from '@/modules/attendance/containers/attendance.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_ATTENDANCE, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderAttendance(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/practices/${MOCK_ATTENDANCE.sessionId}/attendance`]}>
        <Route path="/practices/:sessionId/attendance">
          <AttendanceContainer />
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

describe('attendance coach flow (real client + MSW)', () => {
  it('loads the scoped roster and persists an atomic bulk mark', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAttendance();

    expect(
      await screen.findByTestId(TEST_IDS.attendancePrivacyNotice, {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(screen.getAllByTestId(TEST_IDS.attendanceRosterRow)).toHaveLength(4);
    expect(screen.getByText(/3 of 4 marked/u)).toBeVisible();
    expect(screen.getAllByText(/RSVP is not shared/u)).toHaveLength(4);
    expect(screen.getByText(/Historical member/u)).toBeVisible();

    const submit = screen.getByTestId(TEST_IDS.attendanceSubmit);
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceMarkAllPresent));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(
      () => {
        expect(screen.getByText(/4 of 4 marked/u)).toBeVisible();
        expect(screen.getByTestId(TEST_IDS.attendanceSubmit)).toBeDisabled();
      },
      { timeout: 5000 },
    );
  });

  it('opens bounded attendance history without exposing private fields', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAttendance();

    const historyButtons = await screen.findAllByTestId(
      TEST_IDS.attendanceHistoryButton,
      {},
      { timeout: 5000 },
    );
    fireEvent.click(historyButtons[0]!);

    expect(
      await screen.findByTestId(TEST_IDS.attendanceHistoryPanel, {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(await screen.findByText('No attendance revisions yet.')).toBeVisible();
    expect(screen.queryByText(/@example\.com/u)).not.toBeInTheDocument();
  });

  it('renders the explicit forbidden state for a regular member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAttendance();

    expect(
      await screen.findByText('Grant the required permission to use this feature.'),
    ).toBeVisible();
    expect(screen.queryByTestId(TEST_IDS.attendanceRoster)).not.toBeInTheDocument();
  });
});
