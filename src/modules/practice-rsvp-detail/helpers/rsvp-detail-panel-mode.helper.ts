import type { RsvpDetailPanelInput } from './practice-rsvp-detail-view.helper';
import type { RsvpOverrideDraftActions } from './rsvp-override-panel.helper';
import type { RsvpRevision } from '../types/practice-rsvp-detail.types';

/** The one open detail panel: overriding a member, or reading another's history. */
export type RsvpPanelMode =
  | { readonly kind: 'none' }
  | { readonly kind: 'override'; readonly membershipId: string }
  | { readonly kind: 'history'; readonly membershipId: string };

/** The override form's draft fields, held by the hook until it is submitted. */
export interface RsvpOverrideDraftState {
  readonly status: string;
  readonly reason: string;
  readonly reasonCategory: string;
  readonly note: string;
  readonly noteVisibility: string;
}

export const EMPTY_RSVP_OVERRIDE_DRAFT: RsvpOverrideDraftState = {
  status: '',
  reason: '',
  reasonCategory: '',
  note: '',
  noteVisibility: '',
};

/** Which membership id the history panel is reading, or '' when it is closed. */
export function resolveHistoryMembershipId(mode: RsvpPanelMode): string {
  return mode.kind === 'history' ? mode.membershipId : '';
}

export interface ResolveRsvpDetailPanelInputParams {
  readonly mode: RsvpPanelMode;
  readonly draft: RsvpOverrideDraftState;
  readonly isSubmitting: boolean;
  readonly draftActions: RsvpOverrideDraftActions;
  readonly historyItems: readonly RsvpRevision[];
  readonly isHistoryLoading: boolean;
  readonly onClosePanel: () => void;
}

/**
 * Resolve the open panel into the shape the view helper translates.
 *
 * Only one of override/history is ever open at once — `mode` is the single
 * union value that guarantees that, rather than two independent membership
 * ids a caller could set out of sync with each other.
 */
export function resolveRsvpDetailPanelInput(
  params: ResolveRsvpDetailPanelInputParams,
): RsvpDetailPanelInput {
  if (params.mode.kind === 'override') {
    return {
      kind: 'override',
      draft: {
        membershipId: params.mode.membershipId,
        ...params.draft,
        isSubmitting: params.isSubmitting,
      },
      actions: params.draftActions,
    };
  }
  if (params.mode.kind === 'history') {
    return {
      kind: 'history',
      history: {
        membershipId: params.mode.membershipId,
        isLoading: params.isHistoryLoading,
        items: params.historyItems,
        onClose: params.onClosePanel,
      },
    };
  }
  return { kind: 'none' };
}
