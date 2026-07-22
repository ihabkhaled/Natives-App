import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { AdminOperationsViewProps } from './admin-operations-view.types';
import { AdminOperationsView } from './admin-operations-view.component';

function buildProps(overrides: Partial<AdminOperationsViewProps> = {}): AdminOperationsViewProps {
  return {
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'Offline',
    offlineMessage: 'Reconnect to continue.',
    offlineNoticeLabel: 'Offline',
    isOffline: false,
    forbiddenTitle: 'Not available to you',
    forbiddenMessage: 'No permission.',
    emptyTitle: 'Nothing here yet',
    emptyMessage: 'No operations data.',
    title: 'Operations centre',
    subtitle: 'Queue, jobs, and audit.',
    status: 'ready',
    outboxHeading: 'Outbox health',
    outboxIntro: 'Queue depth by state.',
    outboxMetrics: [{ key: 'pending', label: 'Pending', value: '3' }],
    outboxRefreshLabel: 'Refresh metrics',
    deadLetterHeading: 'Dead letters',
    deadLetterIntro: 'Failed events by id.',
    deadLetterNotice: 'Payload bodies stay on the server.',
    deadLetterPendingNotice: 'The dead-letter listing is not served by the backend yet.',
    deadLetterRows: [],
    jobHeading: 'Job health',
    jobIntro: 'Scheduled jobs.',
    jobPendingNotice: 'Job health is not served by the backend yet.',
    jobRows: [],
    auditHeading: 'Audit log',
    auditIntro: 'Who did what.',
    auditNotice: 'Changed values never render.',
    auditRows: [{ key: 'a1', label: 'settings.update', value: 'Success' }],
    ...overrides,
  };
}

describe('AdminOperationsView', () => {
  it('renders the honest backend-pending panels without inventing rows', () => {
    render(<AdminOperationsView {...buildProps()} />);

    const deadLetters = screen.getByTestId(TEST_IDS.adminDeadLetterPanel);
    expect(deadLetters).toHaveTextContent('not served by the backend yet');
    expect(within(deadLetters).queryAllByTestId(TEST_IDS.adminDeadLetterRow)).toHaveLength(0);
    const jobs = screen.getByTestId(TEST_IDS.adminJobHealthPanel);
    expect(jobs).toHaveTextContent('not served by the backend yet');
    expect(within(jobs).queryAllByTestId(TEST_IDS.adminJobRow)).toHaveLength(0);
  });

  it('lists dead letters by id, type, and failure code with a replay action', async () => {
    // The P1 re-light path: once the backend ships the listing and the
    // capability marker flips, rows render again exactly like this.
    const onReplay = vi.fn();
    render(
      <AdminOperationsView
        {...buildProps({
          deadLetterRows: [
            {
              eventId: 'evt-dead-0001',
              eventType: 'notification.email.send',
              attemptsLabel: '5 attempts',
              failedAtLabel: '19 Jul 2026, 22:15',
              failureCode: 'SMTP_TIMEOUT',
              replayLabel: 'Replay',
              canReplay: true,
              onReplay,
            },
          ],
        })}
      />,
    );

    const row = screen.getByTestId(TEST_IDS.adminDeadLetterRow);
    expect(row).toHaveTextContent('notification.email.send');
    expect(row).toHaveTextContent('SMTP_TIMEOUT');
    await userEvent.click(within(row).getByTestId(TEST_IDS.adminDeadLetterReplay));
    expect(onReplay).toHaveBeenCalledOnce();
  });

  it('disables the replay for a principal without the grant', () => {
    render(
      <AdminOperationsView
        {...buildProps({
          deadLetterRows: [
            {
              eventId: 'evt-dead-0002',
              eventType: 'points.recalculate',
              attemptsLabel: '3 attempts',
              failedAtLabel: '20 Jul 2026, 08:00',
              failureCode: 'DB_TIMEOUT',
              replayLabel: 'Replay',
              canReplay: false,
              onReplay: vi.fn(),
            },
          ],
        })}
      />,
    );

    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(TEST_IDS.adminDeadLetterReplay)).toHaveProperty('disabled', true);
  });

  it('reports outbox metrics and the audit summary as plain fact rows', () => {
    render(<AdminOperationsView {...buildProps()} />);

    expect(screen.getByTestId(TEST_IDS.adminOutboxPanel)).toHaveTextContent('Pending');
    expect(screen.getByTestId(TEST_IDS.adminAuditPanel)).toHaveTextContent('Success');
  });

  it('offers a focusable refresh for the live outbox metrics', async () => {
    const props = buildProps();
    render(<AdminOperationsView {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.adminOutboxRefresh));

    expect(props.onRetry).toHaveBeenCalledOnce();
  });
});
