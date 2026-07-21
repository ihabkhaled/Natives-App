import { describe, expect, it } from 'vitest';

import { buildAuditRows, buildJobRows, buildOutboxRows } from './operations-rows.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

describe('buildOutboxRows', () => {
  it('reports every queue depth', () => {
    const rows = buildOutboxRows(t, {
      pending: 4,
      processing: 1,
      completed: 1842,
      deadLettered: 2,
    });

    expect(rows.map((row) => row.value)).toEqual(['4', '1', '1842', '2']);
  });

  it('tones the dead-letter count by whether anything actually failed', () => {
    expect(
      buildOutboxRows(t, { pending: 0, processing: 0, completed: 0, deadLettered: 3 })[3]?.tone,
    ).toBe('danger');
    expect(
      buildOutboxRows(t, { pending: 0, processing: 0, completed: 0, deadLettered: 0 })[3]?.tone,
    ).toBe('success');
  });

  it('shows zeroes rather than blanks before the metrics resolve', () => {
    expect(buildOutboxRows(t, undefined).map((row) => row.value)).toEqual(['0', '0', '0', '0']);
  });
});

describe('buildJobRows', () => {
  it('labels a job by its status and tones it accordingly', () => {
    const rows = buildJobRows(t, formatInstant, [
      {
        jobKey: 'outbox.dispatcher',
        status: 'healthy',
        lastRunAt: '2026-07-20T08:55:00.000Z',
        failureCount: 0,
      },
      { jobKey: 'reports.expiry', status: 'failed', lastRunAt: null, failureCount: 7 },
    ]);

    expect(rows[0]?.tone).toBe('success');
    expect(rows[0]?.detail).toBe('adminOperations.jobLastRun: formatted:2026-07-20T08:55:00.000Z');
    expect(rows[1]?.tone).toBe('danger');
  });

  it('says a job has never run rather than showing a blank instant', () => {
    const rows = buildJobRows(t, formatInstant, [
      { jobKey: 'reports.expiry', status: 'degraded', lastRunAt: null, failureCount: 1 },
    ]);

    expect(rows[0]?.detail).toBe('adminOperations.jobNeverRun');
    expect(rows[0]?.tone).toBe('warning');
  });
});

describe('buildAuditRows', () => {
  it('summarises a diff as a field count and never renders its values', () => {
    const rows = buildAuditRows(t, formatInstant, [
      {
        id: 'aud-1',
        actorUserId: 'user-admin',
        action: 'settings.version.create',
        resourceType: 'team_setting',
        resourceId: 'attendance_weights',
        correlationId: 'corr-1',
        outcome: 'success',
        changedFieldCount: 2,
        occurredAt: '2026-07-20T08:00:00.000Z',
      },
    ]);

    expect(rows[0]?.detail).toContain('adminOperations.auditDiffFields');
    expect(rows[0]?.detail).not.toContain('redacted');
    expect(rows[0]?.tone).toBe('success');
  });

  it('names the system when no human actor is recorded', () => {
    const rows = buildAuditRows(t, formatInstant, [
      {
        id: 'aud-2',
        actorUserId: null,
        action: 'points.rule.publish',
        resourceType: 'points_rule',
        resourceId: null,
        correlationId: null,
        outcome: 'denied',
        changedFieldCount: 0,
        occurredAt: '2026-07-19T18:30:00.000Z',
      },
    ]);

    expect(rows[0]?.detail).toContain('adminOperations.auditActorSystem');
    expect(rows[0]?.detail).toContain('adminOperations.auditNoDiff');
    expect(rows[0]?.tone).toBe('warning');
  });

  it('tones a failed entry as a failure', () => {
    const rows = buildAuditRows(t, formatInstant, [
      {
        id: 'aud-3',
        actorUserId: 'user-1',
        action: 'roles.assign',
        resourceType: 'membership',
        resourceId: 'm-1',
        correlationId: null,
        outcome: 'failure',
        changedFieldCount: 1,
        occurredAt: '2026-07-19T18:30:00.000Z',
      },
    ]);

    expect(rows[0]?.tone).toBe('danger');
  });
});
