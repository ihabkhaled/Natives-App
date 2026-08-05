import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  RSVP_REASON_LABEL_KEYS,
  RSVP_SOURCE_LABEL_KEYS,
  RSVP_STATUS_LABEL_KEYS,
} from '../constants/practice-rsvp-detail-copy.constants';
import type {
  RsvpHistoryEntryView,
  RsvpHistoryPanelView,
} from '../types/practice-rsvp-detail-view.types';
import type { RsvpRevision } from '../types/practice-rsvp-detail.types';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.practiceRsvpDetail;

/** "went from X to Y", or just "set to Y" for the first response on record. */
function buildTransitionLabel(t: Translate, revision: RsvpRevision): string {
  const to = t(RSVP_STATUS_LABEL_KEYS[revision.toStatus]);
  return revision.fromStatus === null
    ? t(KEYS.historyTransitionFromNone, { to })
    : t(KEYS.historyTransition, { from: t(RSVP_STATUS_LABEL_KEYS[revision.fromStatus]), to });
}

/** Who made the move: a coach's override is distinguished from a normal record. */
function buildAttributionLabel(t: Translate, revision: RsvpRevision): string {
  const source = t(RSVP_SOURCE_LABEL_KEYS[revision.source]);
  return revision.isOverride
    ? t(KEYS.historyAttributionOverride, { source })
    : t(KEYS.historyAttributionRecorded, { source });
}

/**
 * The free-text override reason takes precedence over the reason category:
 * it is the specific, mandatory explanation a coach gave for that one move,
 * where the category is a coarser bucket a self-service RSVP may carry.
 */
function buildReasonLabel(t: Translate, revision: RsvpRevision): string | null {
  if (revision.overrideReason !== null) {
    return revision.overrideReason;
  }
  return revision.reasonCategory === null ? null : t(RSVP_REASON_LABEL_KEYS[revision.reasonCategory]);
}

function buildHistoryEntry(t: Translate, locale: string, revision: RsvpRevision): RsvpHistoryEntryView {
  return {
    id: revision.id,
    transitionLabel: buildTransitionLabel(t, revision),
    occurredLabel: formatCairoDateTime(revision.occurredAtIso, locale),
    attributionLabel: buildAttributionLabel(t, revision),
    reasonLabel: buildReasonLabel(t, revision),
    noteLabel: revision.note,
  };
}

export interface RsvpHistoryPanelInput {
  readonly membershipId: string;
  readonly isLoading: boolean;
  readonly items: readonly RsvpRevision[];
  readonly onClose: () => void;
}

/**
 * Translate one member's revision trail into the panel the screen renders —
 * the whole reason the override endpoint is trustworthy is that this trail
 * stays visible after the override runs.
 */
export function buildHistoryPanelView(
  t: Translate,
  locale: string,
  input: RsvpHistoryPanelInput,
): RsvpHistoryPanelView {
  return {
    membershipId: input.membershipId,
    headingLabel: t(KEYS.historyHeading),
    isLoading: input.isLoading,
    loadingLabel: t(KEYS.historyLoadingLabel),
    emptyLabel: t(KEYS.historyEmptyLabel),
    items: input.items.map((revision) => buildHistoryEntry(t, locale, revision)),
    closeLabel: t(KEYS.historyClose),
    onClose: input.onClose,
  };
}
