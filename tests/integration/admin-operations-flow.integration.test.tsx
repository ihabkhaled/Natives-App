import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AdminOperationsContainer } from '@/modules/admin/containers/admin-operations.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

async function openOperations(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminOperations, APP_PATHS.adminOperations, <AdminOperationsContainer />);
  await screen.findByTestId(TEST_IDS.adminOutboxPanel, {}, WAIT);
}

registerIntegrationSession();

describe('outbox health', () => {
  it('reports every queue depth', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminOutboxPanel);
    expect(within(panel).getAllByTestId(TEST_IDS.adminOutboxMetric)).toHaveLength(4);
    expect(panel).toHaveTextContent('Dead-lettered');
  });
});

describe('the re-lit dead-letter and job-health panels (contract 1.2.0)', () => {
  // `admin/outbox/dead-letters` and `admin/jobs/health` are REAL now: the
  // capability-honesty markers are off, both reads fire, and the panels show
  // rows or an honest zero-state — never an indefinite "Loading…".
  it('lists the dead-lettered events with their sanitized failure codes', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminDeadLetterPanel);
    await waitFor(() => {
      expect(within(panel).getAllByTestId(TEST_IDS.adminDeadLetterRow)).toHaveLength(2);
    }, WAIT);
    expect(panel).toHaveTextContent('notification.email.send');
    expect(panel).toHaveTextContent('SMTP_TIMEOUT');
  });

  it('renders the heartbeat-derived job statuses, including a never-ran job', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminJobHealthPanel);
    await waitFor(() => {
      expect(within(panel).getAllByTestId(TEST_IDS.adminJobRow)).toHaveLength(3);
    }, WAIT);
    expect(panel).toHaveTextContent('outbox.dispatcher');
    expect(panel).toHaveTextContent('Healthy');
    expect(panel).toHaveTextContent('Degraded');
    expect(panel).toHaveTextContent('Failed');
    expect(panel).toHaveTextContent('Never run');
  });

  it('states an honest zero-state when no dead letters exist', async () => {
    mockApiServer.use(
      http.get(apiUrl('/admin/outbox/dead-letters'), () =>
        HttpResponse.json({ items: [], total: 0, limit: 25, offset: 0 }),
      ),
    );
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminDeadLetterPanel);
    await waitFor(() => {
      expect(within(panel).getByTestId(TEST_IDS.adminDeadLetterEmpty)).toBeInTheDocument();
    }, WAIT);
    expect(within(panel).queryAllByTestId(TEST_IDS.adminDeadLetterRow)).toHaveLength(0);
  });

  it('states that payload bodies stay on the server', async () => {
    await openOperations();

    expect(screen.getByTestId(TEST_IDS.adminDeadLetterPanel)).toHaveTextContent(
      'Payload bodies stay on the server',
    );
  });

  it('requeues a dead letter and drops it from the listing', async () => {
    await openOperations();

    const panel = screen.getByTestId(TEST_IDS.adminDeadLetterPanel);
    await waitFor(() => {
      expect(within(panel).getAllByTestId(TEST_IDS.adminDeadLetterRow)).toHaveLength(2);
    }, WAIT);

    fireEvent.click(within(panel).getAllByTestId(TEST_IDS.adminDeadLetterReplay)[0]!);

    await waitFor(() => {
      expect(within(panel).getAllByTestId(TEST_IDS.adminDeadLetterRow)).toHaveLength(1);
    }, WAIT);
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

describe('a failed read offers a retry', () => {
  it('re-issues the outbox metrics from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/admin/outbox/metrics',
      errorTestId: TEST_IDS.adminOpsError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderRoute(
          APP_PATHS.adminOperations,
          APP_PATHS.adminOperations,
          <AdminOperationsContainer />,
        );
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
