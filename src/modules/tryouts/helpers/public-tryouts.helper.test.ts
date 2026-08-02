import { describe, expect, it, vi } from 'vitest';

import { buildTryoutEvent } from '../../../../tests/factories/tryouts.factory';
import {
  buildPublicTryoutCard,
  buildPublicTryoutSteps,
  isEventFull,
  isEventOpen,
  placesLeft,
  selectPublicEvent,
  takenPercent,
} from './public-tryouts.helper';

const t = (key: string): string => key;
const day = (iso: string): string => `day:${iso}`;
const time = (iso: string): string => `time:${iso}`;

function card(event = buildTryoutEvent(), selectedId = '', onApply = vi.fn()) {
  return buildPublicTryoutCard(t, {
    event,
    selectedId,
    formatDay: day,
    formatTime: time,
    onApply,
  });
}

describe('isEventOpen', () => {
  it('accepts applications only for an open session', () => {
    expect(isEventOpen(buildTryoutEvent())).toBe(true);
    expect(isEventOpen(buildTryoutEvent({ status: 'closed' }))).toBe(false);
    expect(isEventOpen(buildTryoutEvent({ status: 'scheduled' }))).toBe(false);
  });
});

describe('isEventFull', () => {
  it('is a capacity fact, independent of the session status', () => {
    expect(isEventFull(buildTryoutEvent({ capacity: 4, registeredCount: 3 }))).toBe(false);
    expect(isEventFull(buildTryoutEvent({ capacity: 4, registeredCount: 4 }))).toBe(true);
  });
});

describe('placesLeft', () => {
  it('counts the remaining places', () => {
    expect(placesLeft(buildTryoutEvent({ capacity: 24, registeredCount: 4 }))).toBe(20);
  });

  it('never reports a negative number of places', () => {
    expect(placesLeft(buildTryoutEvent({ capacity: 2, registeredCount: 5 }))).toBe(0);
  });
});

describe('takenPercent', () => {
  it('reports the share of places already taken', () => {
    expect(takenPercent(buildTryoutEvent({ capacity: 20, registeredCount: 5 }))).toBe(25);
  });

  it('clamps an over-subscribed session at a full meter', () => {
    expect(takenPercent(buildTryoutEvent({ capacity: 2, registeredCount: 5 }))).toBe(100);
  });

  it('treats a session with no capacity as full rather than dividing by zero', () => {
    expect(takenPercent(buildTryoutEvent({ capacity: 0, registeredCount: 0 }))).toBe(100);
  });
});

describe('selectPublicEvent', () => {
  const open = buildTryoutEvent({ tryoutId: 'open-1' });
  const closed = buildTryoutEvent({ tryoutId: 'closed-1', status: 'closed' });

  it('honours the session the candidate picked', () => {
    expect(selectPublicEvent([closed, open], 'closed-1')).toBe(closed);
  });

  it('falls back to the first open session when nothing is picked', () => {
    expect(selectPublicEvent([closed, open], '')).toBe(open);
  });

  it('falls back to the first listed session when none is open', () => {
    expect(selectPublicEvent([closed], '')).toBe(closed);
  });

  it('has nothing to select from an empty list', () => {
    expect(selectPublicEvent([], 'open-1')).toBeNull();
  });
});

describe('buildPublicTryoutCard', () => {
  it('renders both instants through the injected Cairo formatters', () => {
    const view = card(buildTryoutEvent({ heldAt: '2026-08-15T15:00:00.000Z' }));

    expect(view.whenValue).toBe('day:2026-08-15T15:00:00.000Z');
    expect(view.timeValue).toBe('time:2026-08-15T15:00:00.000Z');
  });

  it('names the venue, or says the venue is still to be confirmed', () => {
    expect(card().whereValue).toBe('Maadi pitch 1');
    expect(card(buildTryoutEvent({ venueName: null })).whereValue).toBe(
      'tryouts.publicVenuePending',
    );
  });

  it('counts the remaining places while the session has room', () => {
    const view = card(buildTryoutEvent({ capacity: 24, registeredCount: 4 }));

    expect(view.placesValue).toBe('tryouts.publicPlacesLeft');
    expect(view.takenPercent).toBe(17);
    expect(view.isFull).toBe(false);
  });

  it('says a full session waitlists instead of showing a fake place count', () => {
    const view = card(buildTryoutEvent({ capacity: 2, registeredCount: 2 }));

    expect(view.placesValue).toBe('tryouts.publicPlacesNone');
    expect(view.isFull).toBe(true);
  });

  it('mentions the waitlist only when somebody is on it', () => {
    expect(card().waitlistValue).toBe('tryouts.waitlistSummary');
    expect(card(buildTryoutEvent({ waitlistedCount: 0 })).waitlistValue).toBeNull();
  });

  it('labels the action for an unpicked, a picked, and a closed session', () => {
    expect(card().applyLabel).toBe('tryouts.publicApply');
    expect(card(buildTryoutEvent(), 'try-1').applyLabel).toBe('tryouts.publicApplySelected');
    expect(card(buildTryoutEvent({ status: 'closed' })).applyLabel).toBe(
      'tryouts.publicApplyClosed',
    );
  });

  it('marks the picked session and reports the session status', () => {
    const view = card(buildTryoutEvent(), 'try-1');

    expect(view.isSelected).toBe(true);
    expect(view.isOpen).toBe(true);
    expect(view.statusLabel).toBe('tryouts.eventStatusOpen');
    expect(view.statusTone).toBe('success');
  });

  it('applies for its own session, never for another one', () => {
    const onApply = vi.fn();
    card(buildTryoutEvent({ tryoutId: 'try-9' }), '', onApply).onApply();

    expect(onApply).toHaveBeenCalledWith('try-9');
  });
});

describe('buildPublicTryoutSteps', () => {
  it('resolves all three reassurance steps from the catalog', () => {
    const steps = buildPublicTryoutSteps(t);

    expect(steps.map((step) => step.key)).toEqual(['confirm', 'play', 'outcome']);
    expect(steps[0]?.title).toBe('tryouts.publicStepOneTitle');
    expect(steps[2]?.body).toBe('tryouts.publicStepThreeBody');
  });
});
