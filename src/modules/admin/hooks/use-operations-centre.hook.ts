import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery, useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';
import { toRemoteQueryView } from '@/shared/view';

import { ADMIN_OPERATIONS_COPY } from '../constants/admin-labels.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import { buildAuditRows, buildJobRows, buildOutboxRows } from '../helpers/operations-rows.helper';
import { buildDeadLetterRows } from '../helpers/dead-letter-rows.helper';
import {
  buildAuditQueryOptions,
  buildDeadLettersQueryOptions,
  buildJobHealthQueryOptions,
  buildOutboxMetricsQueryOptions,
} from '../queries/admin.query';
import { adminQueryKeys } from '../queries/admin.keys';
import { replayDeadLetter } from '../services/replay-dead-letter.service';
import type { AuditPage, DeadLetter, JobHealth, OutboxMetrics } from '../types/admin.types';
import type { AdminOperationsView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';

/**
 * The operations centre. Every panel reports state only: queue depth, failed
 * work by id, heartbeat-derived job health, and who did what. No event
 * payload and no audit diff value is fetched, let alone rendered — a dead
 * letter crosses the wire as a stable `failureCode`, never raw error text.
 */
export function useOperationsCentre(): AdminOperationsView {
  const { t, locale } = useAppTranslation();
  const context = useAdminContext();
  const toast = useAppToast();
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);
  const metrics = toRemoteQueryView(
    useAppQuery<OutboxMetrics>(buildOutboxMetricsQueryOptions(context.canManageOutbox)),
  );
  const deadLetters = useAppQuery<readonly DeadLetter[]>(
    buildDeadLettersQueryOptions(context.canManageOutbox),
  );
  const jobs = useAppQuery<readonly JobHealth[]>(
    buildJobHealthQueryOptions(context.canManageOutbox),
  );
  const audit = useAppQuery<AuditPage>(
    buildAuditQueryOptions(context.teamId, context.canReadAudit),
  );
  const replay = useInvalidatingMutation<boolean, string>({
    mutationFn: (eventId) => replayDeadLetter(eventId),
    invalidateKey: adminQueryKeys.operations(),
    onSuccess: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminOperations.replayQueuedToast),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminOperations.replayFailedToast),
        tone: 'danger',
      });
    },
  });

  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_OPERATIONS_COPY,
      error: metrics.error,
      isOffline: context.isOffline,
      onRetry: metrics.refetch,
      emptyTitleKey: I18N_KEYS.adminOperations.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminOperations.emptyMessage,
    }),
    title: t(I18N_KEYS.adminOperations.title),
    subtitle: t(I18N_KEYS.adminOperations.subtitle),
    status: resolveAdminScreenStatus(
      context,
      metrics,
      context.canManageOutbox || context.canReadAudit,
      true,
    ),
    outboxHeading: t(I18N_KEYS.adminOperations.outboxHeading),
    outboxIntro: t(I18N_KEYS.adminOperations.outboxIntro),
    outboxMetrics: buildOutboxRows(t, metrics.data),
    outboxRefreshLabel: t(I18N_KEYS.adminOperations.refreshMetrics),
    deadLetterHeading: t(I18N_KEYS.adminOperations.deadLetterHeading),
    deadLetterIntro: t(I18N_KEYS.adminOperations.deadLetterIntro),
    deadLetterNotice: t(I18N_KEYS.adminOperations.deadLetterNoPayloadNotice),
    deadLetterEmptyLabel: t(I18N_KEYS.adminOperations.deadLetterEmpty),
    deadLetterRows: buildDeadLetterRows(t, formatInstant, deadLetters.data ?? [], {
      canReplay: context.canManageOutbox && !replay.isRunning,
      onReplay: replay.run,
    }),
    jobHeading: t(I18N_KEYS.adminOperations.jobHealthHeading),
    jobIntro: t(I18N_KEYS.adminOperations.jobHealthIntro),
    jobRows: buildJobRows(t, formatInstant, jobs.data ?? []),
    auditHeading: t(I18N_KEYS.adminOperations.auditHeading),
    auditIntro: t(I18N_KEYS.adminOperations.auditIntro),
    auditNotice: t(I18N_KEYS.adminOperations.auditDiffNotice),
    auditRows: buildAuditRows(t, formatInstant, audit.data?.items ?? []),
  };
}
