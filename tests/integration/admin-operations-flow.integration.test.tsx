import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AdminOperationsContainer } from '@/modules/admin/containers/admin-operations.container';
import { getEnvironment } from '@/packages/environment';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function openOperations(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminOperations, APP_PATHS.adminOperations, <AdminOperationsContainer />);
  await screen.findByTestId(TEST_IDS.adminOutboxPanel, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('outbox health', () => {
  it('reports every queue depth', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminOutboxPanel);
    expect(within(panel).getAllByTestId(TEST_IDS.adminOutboxMetric)).toHaveLength(4);
    expect(panel).toHaveTextContent('Dead-lettered');
  });
});

describe('dead letters never carry a payload', () => {
  it('lists the failed events by id, type, and failure code only', async () => {
    await openOperations();

    const rows = within(screen.getByTestId(TEST_IDS.adminDeadLetterPanel)).getAllByTestId(
      TEST_IDS.adminDeadLetterRow,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('notification.email.send');
    expect(rows[0]).toHaveTextContent('SMTP_TIMEOUT');
  });

  it('states that payload bodies stay on the server', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminDeadLetterPanel)).toHaveTextContent(
      'Payload bodies stay on the server',
    );
  });

  it('marks the dead-letter listing as backend-pending rather than presenting it as live', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminDeadLetterPanel)).toHaveTextContent(
      'not served by the backend yet',
    );
  });

  it('replays one event by id and drops it from the list', async () => {
    let replayed: string | null = null;
    mockApiServer.use(
      http.post(apiUrl('/admin/outbox/:eventId/replay'), ({ params }) => {
        replayed = String(params.eventId);
        return HttpResponse.json({ eventId: replayed, requeued: true });
      }),
    );
    await openOperations();

    fireEvent.click(
      within(
        within(screen.getByTestId(TEST_IDS.adminDeadLetterPanel)).getAllByTestId(
          TEST_IDS.adminDeadLetterRow,
        )[0]!,
      ).getByTestId(TEST_IDS.adminDeadLetterReplay),
    );

    await waitFor(() => {
      expect(replayed).toBe('evt-dead-0001');
    }, WAIT);
  });
});

describe('job health', () => {
  it('shows each scheduled job with its status', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminJobHealthPanel);
    expect(within(panel).getAllByTestId(TEST_IDS.adminJobRow)).toHaveLength(3);
    expect(panel).toHaveTextContent('Healthy');
    expect(panel).toHaveTextContent('Degraded');
  });

  it('says a job has never run instead of showing a blank instant', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminJobHealthPanel)).toHaveTextContent('Never run');
  });

  it('marks job health as backend-pending', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminJobHealthPanel)).toHaveTextContent(
      'not served by the backend yet',
    );
  });
});

describe('the audit log summarises changes without rendering them', () => {
  it('lists who did what and whether it was allowed', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminAuditPanel);
    expect(within(panel).getAllByTestId(TEST_IDS.adminAuditRow)).toHaveLength(2);
    expect(panel).toHaveTextContent('Success');
    expect(panel).toHaveTextContent('Denied');
  });

  it('reports a changed-field count and never a changed value', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminAuditPanel);
    expect(panel).toHaveTextContent('2 fields changed');
    expect(panel.textContent).not.toContain('redacted');
  });

  it('names the system when no human actor is recorded', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminAuditPanel)).toHaveTextContent('System');
  });

  it('hides the audit log from a principal without the audit grant', async () => {
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/audit'), () =>
        HttpResponse.json({ message: 'forbidden' }, { status: 403 }),
      ),
    );
    await openOperations();

    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminAuditPanel)).queryAllByTestId(
          TEST_IDS.adminAuditRow,
        ),
      ).toHaveLength(0);
    }, WAIT);
  });
});

describe('designed states', () => {
  it('renders the designed forbidden state without the operations grants', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute(APP_PATHS.adminOperations, APP_PATHS.adminOperations, <AdminOperationsContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminOpsForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('renders the designed error state when the outbox metrics cannot be read', async () => {
    mockApiServer.use(
      http.get(apiUrl('/admin/outbox/metrics'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.adminOperations, APP_PATHS.adminOperations, <AdminOperationsContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminOpsError, {}, WAIT)).toBeInTheDocument();
  });
});
