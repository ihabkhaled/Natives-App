import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation, type TranslateParams } from '@/packages/i18n';
import { useAppQuery, useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';
import { toRemoteQueryView } from '@/shared/view';

import { ADMIN_PLATFORM_COPY } from '../constants/admin-labels.constants';
import { ADMIN_LIMITS } from '../constants/admin.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import { resolvePlatformAdminErrorKey } from '../helpers/platform-admin-error.helper';
import { buildSuperAdminRows } from '../helpers/platform-admins-view.helper';
import { buildSuperAdminsQueryOptions } from '../queries/admin.query';
import { adminQueryKeys } from '../queries/admin.keys';
import { promoteSuperAdmin } from '../services/promote-super-admin.service';
import { revokeSuperAdmin } from '../services/revoke-super-admin.service';
import type { SuperAdmin, SuperAdminRoster } from '../types/admin.types';
import type { AdminPlatformView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';

type Translate = (key: string, params?: TranslateParams) => string;

interface PromoteDraft {
  readonly userId: string;
  readonly reason: string;
}

interface PlatformAdminActions {
  readonly isBusy: boolean;
  readonly isPromoting: boolean;
  readonly confirmPromote: (userId: string, reason: string) => void;
  readonly confirmRevoke: (userId: string, email: string) => void;
}

/**
 * The confirm-gated promote/revoke commands. Every write demands an explicit
 * confirm that names its target; refusals resolve to privilege-specific copy
 * (the last-admin 409 above all) — never a generic conflict toast.
 */
function usePlatformAdminActions(onPromoted: () => void): PlatformAdminActions {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const { confirm } = useConfirmAlert();
  const succeedWith = (message: string): void => {
    void toast.showToast({ message, tone: 'success' });
  };
  const failWith = (error: unknown): void => {
    void toast.showToast({ message: t(resolvePlatformAdminErrorKey(error)), tone: 'danger' });
  };
  const promote = useInvalidatingMutation<SuperAdmin, PromoteDraft>({
    mutationFn: (input) => promoteSuperAdmin(input.userId, input.reason),
    invalidateKey: adminQueryKeys.platformAdmins(),
    onSuccess: () => {
      onPromoted();
      succeedWith(t(I18N_KEYS.adminPlatform.promotedToast));
    },
    onError: failWith,
  });
  const revoke = useInvalidatingMutation<boolean, string>({
    mutationFn: (userId) => revokeSuperAdmin(userId),
    invalidateKey: adminQueryKeys.platformAdmins(),
    onSuccess: () => {
      succeedWith(t(I18N_KEYS.adminPlatform.revokedToast));
    },
    onError: failWith,
  });
  return {
    isBusy: promote.isRunning || revoke.isRunning,
    isPromoting: promote.isRunning,
    confirmPromote: (userId, reason) => {
      void confirm({
        header: t(I18N_KEYS.adminPlatform.promoteConfirmTitle),
        message: t(I18N_KEYS.adminPlatform.promoteConfirmMessage, { userId }),
        confirmLabel: t(I18N_KEYS.adminPlatform.promoteConfirmAction),
        cancelLabel: t(I18N_KEYS.adminPlatform.confirmCancel),
      }).then((confirmed) => {
        if (confirmed) {
          promote.run({ userId, reason });
        }
      });
    },
    confirmRevoke: (userId, email) => {
      void confirm({
        header: t(I18N_KEYS.adminPlatform.revokeConfirmTitle),
        message: t(I18N_KEYS.adminPlatform.revokeConfirmMessage, { email }),
        confirmLabel: t(I18N_KEYS.adminPlatform.revokeConfirmAction),
        cancelLabel: t(I18N_KEYS.adminPlatform.confirmCancel),
      }).then((confirmed) => {
        if (confirmed) {
          revoke.run(userId);
        }
      });
    },
  };
}

interface PromoteValidation {
  readonly userId: string;
  readonly reason: string;
  readonly canSubmit: boolean;
  readonly validationMessage: string | null;
}

/** The promotion draft, trimmed and validated against the audited-reason floor. */
function validatePromoteDraft(t: Translate, draft: PromoteDraft): PromoteValidation {
  const userId = draft.userId.trim();
  const reason = draft.reason.trim();
  const isReasonValid = reason.length >= ADMIN_LIMITS.promoteReasonMinLength;
  return {
    userId,
    reason,
    canSubmit: userId !== '' && isReasonValid,
    validationMessage:
      isReasonValid || draft.reason === '' ? null : t(I18N_KEYS.adminPlatform.reasonRequired),
  };
}

/**
 * The platform super-admin panel: list, promote, revoke. Deliberately a
 * SEPARATE secured flow — never an option on an ordinary team invite — and
 * gated on the GLOBAL `platform.admin` grant only.
 */
export function usePlatformAdmins(): AdminPlatformView {
  const { t, locale } = useAppTranslation();
  const context = useAdminContext();
  const [draft, setDraft] = useState<PromoteDraft>({ userId: '', reason: '' });
  const actions = usePlatformAdminActions(() => {
    setDraft({ userId: '', reason: '' });
  });
  const roster = toRemoteQueryView(
    useAppQuery<SuperAdminRoster>(buildSuperAdminsQueryOptions(context.canManagePlatform)),
  );
  const validation = validatePromoteDraft(t, draft);
  const rows = buildSuperAdminRows(
    t,
    (iso) => formatCairoDateTime(iso, locale),
    roster.data?.items ?? [],
    {
      canRevoke: context.canManagePlatform && !actions.isBusy,
      onRevoke: actions.confirmRevoke,
    },
  );
  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_PLATFORM_COPY,
      error: roster.error,
      isOffline: context.isOffline,
      onRetry: roster.refetch,
      emptyTitleKey: I18N_KEYS.adminPlatform.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminPlatform.emptyMessage,
    }),
    title: t(I18N_KEYS.adminPlatform.title),
    subtitle: t(I18N_KEYS.adminPlatform.subtitle),
    status: resolveAdminScreenStatus(context, roster, context.canManagePlatform, rows.length > 0),
    rosterHeading: t(I18N_KEYS.adminPlatform.rosterHeading),
    rosterIntro: t(I18N_KEYS.adminPlatform.rosterIntro),
    auditNotice: t(I18N_KEYS.adminPlatform.auditNotice),
    rows,
    promoteHeading: t(I18N_KEYS.adminPlatform.promoteHeading),
    promoteIntro: t(I18N_KEYS.adminPlatform.promoteIntro),
    userIdLabel: t(I18N_KEYS.adminPlatform.userIdLabel),
    userIdPlaceholder: t(I18N_KEYS.adminPlatform.userIdPlaceholder),
    userIdValue: draft.userId,
    onUserIdChange: (value) => {
      setDraft((current) => ({ ...current, userId: value }));
    },
    reasonLabel: t(I18N_KEYS.adminPlatform.reasonLabel),
    reasonPlaceholder: t(I18N_KEYS.adminPlatform.reasonPlaceholder),
    reasonValue: draft.reason,
    onReasonChange: (value) => {
      setDraft((current) => ({ ...current, reason: value }));
    },
    validationMessage: validation.validationMessage,
    promoteLabel: t(I18N_KEYS.adminPlatform.promoteAction),
    isPromoting: actions.isPromoting,
    canPromote: validation.canSubmit && !actions.isBusy,
    onPromote: () => {
      if (!validation.canSubmit || actions.isBusy) {
        return;
      }
      actions.confirmPromote(validation.userId, validation.reason);
    },
  };
}
