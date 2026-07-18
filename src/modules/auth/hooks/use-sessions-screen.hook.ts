import { formatDateTime } from '@/packages/date';
import { useAppTranslation, type TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';
import { useAppToast } from '@/shared/ui';

import { useSessionRevocationMutation } from '../mutations/use-session-revocation-mutation.hook';
import type { DeviceSession } from '../types/auth.types';
import { useSessionsQuery } from './use-sessions-query.hook';

export interface SessionRowView {
  readonly id: string;
  readonly device: string;
  readonly location: string;
  readonly lastActiveText: string;
  readonly isCurrent: boolean;
}

interface SessionsScreenLabels {
  readonly title: string;
  readonly intro: string;
  readonly current: string;
  readonly revoke: string;
  readonly revokeOthers: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly errorTitle: string;
  readonly retry: string;
  readonly loading: string;
}

export interface SessionsScreenView {
  readonly labels: SessionsScreenLabels;
  readonly rows: readonly SessionRowView[];
  readonly hasOtherSessions: boolean;
  readonly isLoading: boolean;
  readonly errorMessage: string | undefined;
  readonly isRevoking: boolean;
  readonly onRevoke: (sessionId: string) => void;
  readonly onRevokeOthers: () => void;
  readonly onRetry: () => void;
}

type Translate = (key: string, params?: TranslateParams) => string;

function buildLabels(t: Translate): SessionsScreenLabels {
  return {
    title: t(I18N_KEYS.sessions.title),
    intro: t(I18N_KEYS.sessions.intro),
    current: t(I18N_KEYS.sessions.current),
    revoke: t(I18N_KEYS.sessions.revoke),
    revokeOthers: t(I18N_KEYS.sessions.revokeOthers),
    emptyTitle: t(I18N_KEYS.sessions.emptyTitle),
    emptyMessage: t(I18N_KEYS.sessions.emptyMessage),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    retry: t(I18N_KEYS.common.retry),
    loading: t(I18N_KEYS.common.loading),
  };
}

function toRow(session: DeviceSession, t: Translate, locale: string): SessionRowView {
  return {
    id: session.id,
    device: session.device === '' ? t(I18N_KEYS.sessions.unknownDevice) : session.device,
    location: session.approxLocation,
    lastActiveText: t(I18N_KEYS.sessions.lastActive, {
      when: formatDateTime(session.lastActiveAtIso, locale),
    }),
    isCurrent: session.isCurrent,
  };
}

/** View model for the session-management screen: list, revoke, revoke-others. */
export function useSessionsScreen(): SessionsScreenView {
  const { t, locale } = useAppTranslation();
  const { showToast } = useAppToast();
  const sessionsQuery = useSessionsQuery();
  const revocation = useSessionRevocationMutation({
    onSuccess: () => {
      void showToast({ message: t(I18N_KEYS.sessions.revokedToast), tone: 'success' });
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.sessions.revokeFailedToast), tone: 'danger' });
    },
  });
  const rows = sessionsQuery.sessions.map((session) => toRow(session, t, locale));
  return {
    labels: buildLabels(t),
    rows,
    hasOtherSessions: rows.some((row) => !row.isCurrent),
    isLoading: sessionsQuery.isLoading,
    errorMessage:
      sessionsQuery.error === null ? undefined : t(mapErrorCodeToI18nKey(sessionsQuery.error.code)),
    isRevoking: revocation.isRevoking,
    onRevoke: revocation.revokeOne,
    onRevokeOthers: revocation.revokeOthers,
    onRetry: sessionsQuery.refetch,
  };
}
