import { I18N_KEYS } from '@/shared/i18n';

import {
  AUDIT_OUTCOME_LABEL_KEYS,
  AUDIT_OUTCOME_TONES,
  JOB_STATUS_LABEL_KEYS,
  JOB_STATUS_TONES,
} from '../constants/admin-labels.constants';
import type { AuditEntry, JobHealth, OutboxMetrics } from '../types/admin.types';
import type { AdminFactRowView } from '../types/admin-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;
type FormatInstant = (iso: string) => string;

export function buildOutboxRows(
  t: Translate,
  metrics: OutboxMetrics | undefined,
): readonly AdminFactRowView[] {
  const counts = metrics ?? { pending: 0, processing: 0, completed: 0, deadLettered: 0 };
  return [
    {
      key: 'pending',
      label: t(I18N_KEYS.adminOperations.outboxPending),
      value: `${counts.pending}`,
    },
    {
      key: 'processing',
      label: t(I18N_KEYS.adminOperations.outboxProcessing),
      value: `${counts.processing}`,
    },
    {
      key: 'completed',
      label: t(I18N_KEYS.adminOperations.outboxCompleted),
      value: `${counts.completed}`,
    },
    {
      key: 'dead',
      label: t(I18N_KEYS.adminOperations.outboxDeadLettered),
      value: `${counts.deadLettered}`,
      tone: counts.deadLettered > 0 ? 'danger' : 'success',
    },
  ];
}

export function buildJobRows(
  t: Translate,
  formatInstant: FormatInstant,
  jobs: readonly JobHealth[],
): readonly AdminFactRowView[] {
  return jobs.map((job) => ({
    key: job.jobKey,
    label: job.jobKey,
    value: t(JOB_STATUS_LABEL_KEYS[job.status]),
    detail:
      job.lastRunAt === null
        ? t(I18N_KEYS.adminOperations.jobNeverRun)
        : `${t(I18N_KEYS.adminOperations.jobLastRun)}: ${formatInstant(job.lastRunAt)}`,
    tone: JOB_STATUS_TONES[job.status],
  }));
}

/**
 * Audit rows carry a changed-field *count*, never the values: the mapper has
 * already discarded them, so there is nothing here that could leak a diff.
 */
export function buildAuditRows(
  t: Translate,
  formatInstant: FormatInstant,
  entries: readonly AuditEntry[],
): readonly AdminFactRowView[] {
  return entries.map((entry) => ({
    key: entry.id,
    label: `${entry.action} · ${entry.resourceType}`,
    value: t(AUDIT_OUTCOME_LABEL_KEYS[entry.outcome]),
    detail: [
      `${t(I18N_KEYS.adminOperations.auditActorLabel)}: ${entry.actorUserId ?? t(I18N_KEYS.adminOperations.auditActorSystem)}`,
      formatInstant(entry.occurredAt),
      entry.changedFieldCount === 0
        ? t(I18N_KEYS.adminOperations.auditNoDiff)
        : t(I18N_KEYS.adminOperations.auditDiffFields, { count: entry.changedFieldCount }),
    ].join(' · '),
    tone: AUDIT_OUTCOME_TONES[entry.outcome],
  }));
}
