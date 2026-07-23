import { formatCairoDate, formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import { BUDDY_STATUS, type BuddyStatus } from '../constants/training.constants';
import type { BuddySectionView } from '../types/training-view.types';
import type { TrainingBuddy, TrainingBuddyPage } from '../types/training.types';

type Translate = (key: string, params?: TranslateParams) => string;

const STATUS_LABEL_KEYS: Record<BuddyStatus, I18nKey> = {
  [BUDDY_STATUS.pending]: I18N_KEYS.training.buddyStatusPending,
  [BUDDY_STATUS.confirmed]: I18N_KEYS.training.buddyStatusConfirmed,
  [BUDDY_STATUS.declined]: I18N_KEYS.training.buddyStatusDeclined,
};

const STATUS_TONES: Record<BuddyStatus, string> = {
  [BUDDY_STATUS.pending]: 'warning',
  [BUDDY_STATUS.confirmed]: 'success',
  [BUDDY_STATUS.declined]: 'medium',
};

export interface BuildBuddySectionParams {
  readonly t: Translate;
  readonly locale: string;
  readonly page: TrainingBuddyPage | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busyBuddyId: string | null;
  readonly busyIntent: 'confirm' | 'decline' | null;
  readonly onConfirm: (buddyId: string) => void;
  readonly onDecline: (buddyId: string) => void;
}

function buildCredit(params: BuildBuddySectionParams, buddy: TrainingBuddy) {
  const { t, locale } = params;
  const isBusy = params.busyBuddyId === buddy.id;
  return {
    id: buddy.id,
    claimLabel: t(I18N_KEYS.training.buddyClaimLabel, {
      identifier: buddy.submissionId.slice(-6),
    }),
    dateLabel: formatCairoDate(buddy.createdAtIso, locale),
    statusLabel: t(STATUS_LABEL_KEYS[buddy.status]),
    statusTone: STATUS_TONES[buddy.status],
    respondedLabel:
      buddy.respondedAtIso === null
        ? null
        : t(I18N_KEYS.training.buddyRespondedLabel, {
            when: formatCairoDateTime(buddy.respondedAtIso, locale),
          }),
    isPending: buddy.status === BUDDY_STATUS.pending,
    isConfirming: isBusy && params.busyIntent === 'confirm',
    isDeclining: isBusy && params.busyIntent === 'decline',
  };
}

/** Prepared buddy-confirmations section with its pending-count badge. */
export function buildBuddySection(params: BuildBuddySectionParams): BuddySectionView {
  const { t } = params;
  const items = params.page?.items ?? [];
  const pendingCount = items.filter((buddy) => buddy.status === BUDDY_STATUS.pending).length;
  return {
    title: t(I18N_KEYS.training.buddyTitle),
    intro: t(I18N_KEYS.training.buddyIntro),
    countBadge:
      pendingCount > 0 ? t(I18N_KEYS.training.buddyCountLabel, { count: pendingCount }) : null,
    emptyLabel: t(I18N_KEYS.training.buddyCreditsEmpty),
    unavailableMessage: params.error === null ? null : t(I18N_KEYS.training.buddyUnavailable),
    isLoading: params.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    confirmLabel: t(I18N_KEYS.training.buddyConfirm),
    declineLabel: t(I18N_KEYS.training.buddyDecline),
    items: items.map((buddy) => buildCredit(params, buddy)),
    onConfirm: params.onConfirm,
    onDecline: params.onDecline,
  };
}
