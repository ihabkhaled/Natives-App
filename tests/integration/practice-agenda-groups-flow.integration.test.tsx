import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PracticeAgendaGroupsContainer } from '@/modules/practice-agenda-groups/containers/practice-agenda-groups.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import { fireIonInput } from '../setup/ionic-events.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderGroups(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/practice-sessions/session-1/agenda/groups']}>
        <Route path="/practice-sessions/:sessionId/agenda/groups">
          <PracticeAgendaGroupsContainer />
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

describe('practice agenda groups flow (real client + MSW)', () => {
  it('reads the resolved plan, with a station next to the group it belongs to', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderGroups();

    await screen.findByTestId(TEST_IDS.practiceAgendaGroupsPlan, {}, WAIT);

    expect(screen.getByText('Deep cuts')).toBeInTheDocument();
    expect(screen.getAllByText('Handlers').length).toBeGreaterThan(0);
  });

  it('creates a group and shows it once the plan is re-read', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderGroups();

    await screen.findByTestId(TEST_IDS.practiceAgendaGroupsCreateForm, {}, WAIT);
    const before = screen.getAllByTestId(TEST_IDS.practiceAgendaGroupsGroupRow).length;

    fireIonInput(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateName), 'Rotation squad');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.practiceAgendaGroupsGroupRow).length).toBe(before + 1);
    });
    expect(screen.getByText('Rotation squad')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsNotice)).toHaveTextContent(/created/i);
  });

  it('adds a member to a group and shows them once the plan is re-read', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderGroups();

    await screen.findAllByTestId(TEST_IDS.practiceAgendaGroupsAddMemberInput, {}, WAIT);
    const [input] = screen.getAllByTestId(TEST_IDS.practiceAgendaGroupsAddMemberInput);
    const [submit] = screen.getAllByTestId(TEST_IDS.practiceAgendaGroupsAddMemberSubmit);

    fireIonInput(input!, 'membership-77');
    await waitFor(() => {
      expect(submit).not.toBeDisabled();
    });
    fireEvent.click(submit!);

    await waitFor(() => {
      expect(screen.getByText('membership-77')).toBeInTheDocument();
    });
  });

  it('copies groups from another session and replaces the current ones', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderGroups();

    await screen.findByTestId(TEST_IDS.practiceAgendaGroupsCopyForm, {}, WAIT);

    fireIonInput(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopySource), 'session-2');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopySubmit)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopySubmit));

    await waitFor(() => {
      expect(screen.getByText('Copied squad')).toBeInTheDocument();
    });
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsNotice)).toHaveTextContent(/copied/i);
  });

  /**
   * The plan carries private coach notes and the roster split; a member
   * attending the session has no more reason to see either than who has not
   * RSVPed.
   */
  it('withholds the screen from a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderGroups();

    await screen.findByTestId(TEST_IDS.practiceAgendaGroupsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsCreateForm)).not.toBeInTheDocument();
  });
});
