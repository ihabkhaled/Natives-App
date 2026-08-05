import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PracticeRemindersContainer } from '@/modules/practice-reminders/containers/practice-reminders.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderReminders(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/practice-sessions/session-mock-1/reminders']}>
        <Route path="/practice-sessions/:sessionId/reminders">
          <PracticeRemindersContainer />
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

describe('practice reminders flow (real client + MSW)', () => {
  it('reports who has not replied and that the window is open', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReminders();

    await screen.findByTestId(TEST_IDS.practiceRemindersNoResponse, {}, { timeout: 5000 });

    expect(screen.getByTestId(TEST_IDS.practiceRemindersNoResponse)).toHaveTextContent('4');
    expect(screen.getByTestId(TEST_IDS.practiceRemindersWindow)).toHaveTextContent(
      /window is open/i,
    );
    expect(screen.getByTestId(TEST_IDS.practiceRemindersKinds)).toBeInTheDocument();
  });

  /**
   * The dispatch returns candidates AND enqueued because they differ: three of
   * the four recipients sat inside their own quiet hours. Reporting only
   * "sent" would tell a coach the roster was reached when it was not.
   */
  it('names how many were queued and how many were held back', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReminders();

    await screen.findByTestId(TEST_IDS.practiceRemindersDispatch, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRemindersDispatch));

    const messages = await screen.findByTestId(
      TEST_IDS.practiceRemindersMessages,
      {},
      { timeout: 5000 },
    );
    expect(messages).toHaveTextContent(/Queued 1 of 4/i);
    expect(messages).toHaveTextContent(/3 were held back/i);
  });

  /**
   * Once nothing is due the button must disable itself. An enabled button that
   * can only answer "nothing was due" reads as a failure the coach caused.
   */
  it('disables the send once nothing is left due', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReminders();

    await screen.findByTestId(TEST_IDS.practiceRemindersDispatch, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRemindersDispatch));

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.practiceRemindersDispatch)).toHaveProperty(
          'disabled',
          true,
        );
      },
      { timeout: 5000 },
    );
  });

  it('confirms a self-test goes to the caller and nobody else', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderReminders();

    await screen.findByTestId(TEST_IDS.practiceRemindersTest, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRemindersTest));

    const messages = await screen.findByTestId(
      TEST_IDS.practiceRemindersMessages,
      {},
      { timeout: 5000 },
    );
    expect(messages).toHaveTextContent(/you and nobody else/i);
  });

  /**
   * A member may read the agenda of a session they attend. Who has not replied
   * is roster information, and mailing them is a coach's action.
   */
  it('withholds the screen from a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderReminders();

    await screen.findByTestId(TEST_IDS.practiceRemindersForbidden, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.practiceRemindersDispatch)).not.toBeInTheDocument();
  });
});
