type JsonObject = Record<string, unknown>;

/**
 * A session with reminders still due: fifteen eligible, four of whom have not
 * replied. The dispatch deliberately queues fewer than it finds — three
 * recipients sit inside their own quiet hours — because "everyone was
 * reached" is the easy case and the one that hides the interesting bug.
 */
const ELIGIBLE = 15;
const NO_RESPONSE = 4;
const QUIET_HOURS_HELD_BACK = 3;

let dispatched = false;

export function resetMockReminderState(): void {
  dispatched = false;
}

export function readMockReminderStatus(): JsonObject {
  return {
    sessionId: 'session-mock-1',
    totalEligible: ELIGIBLE,
    noResponse: NO_RESPONSE,
    upcoming: true,
    cutoff: false,
    urgentCancellationOverride: false,
    // Nothing is left due once a dispatch has run, which is what lets a test
    // prove the button disables itself rather than inviting a second send.
    kinds: dispatched ? [] : ['rsvp_reminder', 'session_published'],
  };
}

export function dispatchMockReminders(): JsonObject {
  if (dispatched) {
    return { candidates: 0, enqueued: 0 };
  }
  dispatched = true;
  return { candidates: NO_RESPONSE, enqueued: NO_RESPONSE - QUIET_HOURS_HELD_BACK };
}

/** The self-test always queues here; the quiet-hours refusal is unit-tested. */
export function testMockReminder(): JsonObject {
  return { enqueued: true };
}
