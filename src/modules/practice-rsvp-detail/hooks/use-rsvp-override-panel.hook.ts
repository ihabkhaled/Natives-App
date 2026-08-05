import { useState } from 'react';

import type { RsvpReason, RsvpStatus } from '@/modules/practice';
import { useAppTranslation } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import { resolveHistoryMembershipId } from '../helpers/rsvp-detail-panel-mode.helper';
import {
  EMPTY_RSVP_OVERRIDE_DRAFT,
  type RsvpOverrideDraftState,
  type RsvpPanelMode,
} from '../helpers/rsvp-detail-panel-mode.helper';
import type { RsvpOverrideDraftActions } from '../helpers/rsvp-override-panel.helper';
import type { RosterRowActions } from '../helpers/rsvp-roster-row.helper';
import { useOverrideRsvpMutation } from '../mutations/use-override-rsvp-mutation.hook';
import type { RsvpOverrideMutationScope } from '../mutations/practice-rsvp-detail-mutations.types';

const KEYS = I18N_KEYS.practiceRsvpDetail;

export interface RsvpOverridePanelController {
  readonly mode: RsvpPanelMode;
  readonly draft: RsvpOverrideDraftState;
  readonly isSubmitting: boolean;
  readonly draftActions: RsvpOverrideDraftActions;
  readonly rosterActions: RosterRowActions;
  readonly historyMembershipId: string;
  readonly onClosePanel: () => void;
}

/**
 * Owns the one open detail panel — override or history — for the RSVP-detail
 * screen: which member it is open for, the override draft, and the
 * confirm-then-mutate flow. Split out of the screen hook so each hook stays
 * under the line and statement budget the lint config enforces.
 *
 * An override changes somebody else's answer, so it is always confirmed
 * before it reaches the mutation, and never rendered optimistically.
 */
export function useRsvpOverridePanel(scope: RsvpOverrideMutationScope): RsvpOverridePanelController {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const { confirm } = useConfirmAlert();
  const [mode, setMode] = useState<RsvpPanelMode>({ kind: 'none' });
  const [draft, setDraft] = useState<RsvpOverrideDraftState>(EMPTY_RSVP_OVERRIDE_DRAFT);

  function closePanel(): void {
    setMode({ kind: 'none' });
    setDraft(EMPTY_RSVP_OVERRIDE_DRAFT);
  }

  const overrideMutation = useOverrideRsvpMutation(scope, {
    onSuccess: () => {
      void showToast({ message: t(KEYS.overrideSuccessToast), tone: 'success' });
      closePanel();
    },
    onError: (error) => {
      const isConflict = toAppError(error).code === APP_ERROR_CODE.Conflict;
      void showToast({
        message: t(isConflict ? KEYS.overrideConflictToast : KEYS.overrideErrorToast),
        tone: isConflict ? 'warning' : 'danger',
      });
    },
  });

  function updateDraftField(field: keyof RsvpOverrideDraftState): (value: string) => void {
    return (value) => {
      setDraft((current) => ({ ...current, [field]: value }));
    };
  }

  /**
   * `membershipId` arrives as a parameter — `activeMembershipId` below —
   * rather than being re-derived from `mode` in here. `onSubmit` is only
   * ever exposed to the UI while the override panel is open, so this always
   * runs with the member that panel is open for.
   */
  function submitOverride(membershipId: string): void {
    void confirm({
      header: t(KEYS.overrideConfirmTitle),
      message: t(KEYS.overrideConfirmMessage),
      confirmLabel: t(KEYS.overrideConfirmAction),
      cancelLabel: t(KEYS.overrideCancelAction),
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      overrideMutation.submit({
        membershipId,
        status: draft.status as RsvpStatus,
        reason: draft.reason.trim(),
        reasonCategory: draft.reasonCategory === '' ? null : (draft.reasonCategory as RsvpReason),
        note: draft.note.trim() === '' ? null : draft.note.trim(),
        noteVisibility: draft.noteVisibility === '' ? null : (draft.noteVisibility as never),
        expectedVersion: null,
      });
    });
  }

  // Both open panels carry the member they are open for; only 'none' does
  // not. Reading it here means `onSubmit` needs no branch of its own — it is
  // wired unconditionally and only ever actually invoked while the override
  // panel (which alone exposes it) is the one open.
  const activeMembershipId = mode.kind === 'none' ? '' : mode.membershipId;

  return {
    mode,
    draft,
    isSubmitting: overrideMutation.isSubmitting,
    draftActions: {
      onStatusChange: updateDraftField('status'),
      onReasonChange: updateDraftField('reason'),
      onReasonCategoryChange: updateDraftField('reasonCategory'),
      onNoteChange: updateDraftField('note'),
      onNoteVisibilityChange: updateDraftField('noteVisibility'),
      onSubmit: () => {
        submitOverride(activeMembershipId);
      },
      onCancel: closePanel,
    },
    rosterActions: {
      onOverride: (membershipId) => {
        setMode({ kind: 'override', membershipId });
        setDraft(EMPTY_RSVP_OVERRIDE_DRAFT);
      },
      onViewHistory: (membershipId) => {
        setMode({ kind: 'history', membershipId });
      },
    },
    historyMembershipId: resolveHistoryMembershipId(mode),
    onClosePanel: closePanel,
  };
}
