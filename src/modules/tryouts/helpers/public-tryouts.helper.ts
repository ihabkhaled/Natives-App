import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { EVENT_STATUS_LABEL_KEYS, EVENT_STATUS_TONES } from '../constants/tryouts-labels.constants';
import { PUBLIC_STEP_KEYS } from '../constants/public-tryouts.constants';
import type { TryoutEvent } from '../types/tryouts.types';
import type {
  PublicTryoutCardView,
  PublicTryoutStepView,
} from '../types/public-tryouts-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Only an open session accepts an application; the rest are read-only. */
export function isEventOpen(event: TryoutEvent): boolean {
  return event.status === 'open';
}

/** Full is a capacity fact, not a status: a full open session waitlists. */
export function isEventFull(event: TryoutEvent): boolean {
  return event.registeredCount >= event.capacity;
}

/** Remaining places, floored at zero so an over-subscribed count never goes negative. */
export function placesLeft(event: TryoutEvent): number {
  return Math.max(event.capacity - event.registeredCount, 0);
}

/** Meter fill, 0–100. A zero-capacity session reads as full rather than dividing by zero. */
export function takenPercent(event: TryoutEvent): number {
  if (event.capacity <= 0) {
    return 100;
  }
  return Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100);
}

/**
 * The session the form applies to: the explicit choice when it is still in
 * the list, otherwise the first session that is actually open, otherwise the
 * first listed one so a closed-only list still renders its (blocked) form.
 */
export function selectPublicEvent(
  events: readonly TryoutEvent[],
  requestedId: string,
): TryoutEvent | null {
  const requested = events.find((item) => item.tryoutId === requestedId);
  return requested ?? events.find((item) => isEventOpen(item)) ?? events[0] ?? null;
}

export interface PublicCardInput {
  readonly event: TryoutEvent;
  readonly selectedId: string;
  readonly formatDay: (iso: string) => string;
  readonly formatTime: (iso: string) => string;
  readonly onApply: (tryoutId: string) => void;
}

function applyLabelKey(event: TryoutEvent, isSelected: boolean): string {
  if (!isEventOpen(event)) {
    return I18N_KEYS.tryouts.publicApplyClosed;
  }
  return isSelected ? I18N_KEYS.tryouts.publicApplySelected : I18N_KEYS.tryouts.publicApply;
}

function placesValue(t: Translate, event: TryoutEvent): string {
  return isEventFull(event)
    ? t(I18N_KEYS.tryouts.publicPlacesNone)
    : t(I18N_KEYS.tryouts.publicPlacesLeft, {
        places: placesLeft(event),
        capacity: event.capacity,
      });
}

/** One session card. Every value is derived from the event DTO or the catalog. */
export function buildPublicTryoutCard(t: Translate, input: PublicCardInput): PublicTryoutCardView {
  const event = input.event;
  const isSelected = event.tryoutId === input.selectedId;
  return {
    id: event.tryoutId,
    name: event.name,
    statusLabel: t(EVENT_STATUS_LABEL_KEYS[event.status]),
    statusTone: EVENT_STATUS_TONES[event.status],
    whenLabel: t(I18N_KEYS.tryouts.publicWhenLabel),
    whenValue: input.formatDay(event.heldAt),
    timeValue: input.formatTime(event.heldAt),
    whereLabel: t(I18N_KEYS.tryouts.publicWhereLabel),
    whereValue: event.venueName ?? t(I18N_KEYS.tryouts.publicVenuePending),
    placesLabel: t(I18N_KEYS.tryouts.publicPlacesLabel),
    placesValue: placesValue(t, event),
    waitlistValue:
      event.waitlistedCount > 0
        ? t(I18N_KEYS.tryouts.waitlistSummary, { count: event.waitlistedCount })
        : null,
    takenPercent: takenPercent(event),
    isFull: isEventFull(event),
    isOpen: isEventOpen(event),
    isSelected,
    applyLabel: t(applyLabelKey(event, isSelected)),
    onApply: () => {
      input.onApply(event.tryoutId);
    },
  };
}

/** The three reassurance steps under the form. Static copy, one catalog key each. */
export function buildPublicTryoutSteps(t: Translate): readonly PublicTryoutStepView[] {
  return PUBLIC_STEP_KEYS.map((step) => ({
    key: step.key,
    title: t(step.titleKey),
    body: t(step.bodyKey),
  }));
}
