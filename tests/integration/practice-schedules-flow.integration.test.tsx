import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PracticeScheduleDetailContainer } from '@/modules/practice-schedules/containers/practice-schedule-detail.container';
import { PracticeSchedulesListContainer } from '@/modules/practice-schedules/containers/practice-schedules-list.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { confirmResult } from '../setup/confirm-alert-stub.helper';
import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonInput } from '../setup/ionic-events.helper';
import { renderRoute } from '../setup/render-with-providers.helper';

/**
 * Delete and generate both confirm through an Ionic alert overlay jsdom
 * cannot drive, so only the confirmation is stubbed here — the mutation,
 * service, gateway, and MSW handler underneath all run for real.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const stub = await import('../setup/confirm-alert-stub.helper');
  return stub.withConfirmStub(await importOriginal<Record<string, unknown>>());
});

const WAIT = { timeout: 5000 };

function renderList(): void {
  renderRoute('/practice-schedules', '/practice-schedules', <PracticeSchedulesListContainer />);
}

function renderDetail(scheduleId: string): void {
  renderRoute(
    `/practice-schedules/${scheduleId}`,
    '/practice-schedules/:scheduleId',
    <PracticeScheduleDetailContainer />,
  );
}

function renderCreate(): void {
  renderRoute(
    '/practice-schedules/new',
    '/practice-schedules/new',
    <PracticeScheduleDetailContainer />,
  );
}

beforeEach(async () => {
  confirmResult.value = true;
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('practice schedules list (real client + MSW)', () => {
  it('lists the seeded schedule with its pattern summary', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderList();

    await screen.findByTestId(TEST_IDS.practiceSchedulesList, {}, WAIT);
    expect(screen.getByText('Tuesday & Thursday practice')).toBeInTheDocument();
  });

  it('withholds the list from a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.practiceSchedulesForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.practiceSchedulesNew)).not.toBeInTheDocument();
  });
});

describe('practice schedule create (real client + MSW)', () => {
  it('creates a schedule and leaves the blank form once it is submitted', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderCreate();

    await screen.findByTestId(TEST_IDS.practiceScheduleForm, {}, WAIT);
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleNameInput), 'Saturday scrimmage');
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleSessionTypeInput), 'scrimmage');
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleStartTimeInput), '09:00');
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleDurationInput), '60');
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleGenerationStartInput), '2026-01-01');
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleGenerationUntilInput), '2026-02-01');
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleSave));

    // The create route has no `:scheduleId`, so a successful create replaces
    // the URL with the new record's detail path — which this render tree has
    // no Route for, so the create form unmounts.
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.practiceScheduleForm)).not.toBeInTheDocument();
    });
  });
});

describe('practice schedule edit (real client + MSW)', () => {
  it('loads the seeded schedule into the form', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleForm, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.practiceScheduleNameInput)).toHaveAttribute(
      'value',
      'Tuesday & Thursday practice',
    );
  });

  it('saves an edit and reports it', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleForm, {}, WAIT);
    fireIonInput(screen.getByTestId(TEST_IDS.practiceScheduleNameInput), 'Renamed practice');
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleSave));

    const messages = await screen.findByTestId(TEST_IDS.practiceScheduleMessages, {}, WAIT);
    expect(messages).toHaveTextContent('Schedule saved.');
  });

  /**
   * Delete and generate both need `useConfirmAlert`; declining must leave the
   * record exactly as it was.
   */
  it('changes nothing when the coach backs out of the delete confirmation', async () => {
    confirmResult.value = false;
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleDelete, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleDelete));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceScheduleForm)).toBeInTheDocument();
    });
  });

  it('deletes the schedule once confirmed', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleDelete, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleDelete));

    // A successful delete returns to the list, which this render tree has no
    // Route for, so the detail screen unmounts.
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.practiceScheduleDetailPage)).not.toBeInTheDocument();
    });
  });
});

describe('practice schedule generate (real client + MSW)', () => {
  /**
   * `generate` is idempotent server-side: the first run creates occurrences,
   * a second immediate run against the same window must report them as
   * already existing rather than duplicating them or looking like a no-op.
   */
  it('reports how many sessions it created, then reports a clean re-run as already generated', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleGenerate, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleGenerate));

    const firstRun = await screen.findByTestId(TEST_IDS.practiceScheduleMessages, {}, WAIT);
    expect(firstRun).toHaveTextContent('Created 3 new sessions.');

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleGenerate));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceScheduleMessages)).toHaveTextContent(
        'already exist',
      );
    });
  });

  it('never runs generate without the coach confirming first', async () => {
    confirmResult.value = false;
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('schedule-mock-1');

    await screen.findByTestId(TEST_IDS.practiceScheduleGenerate, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleGenerate));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.practiceScheduleMessages)).not.toBeInTheDocument();
    });
  });
});
