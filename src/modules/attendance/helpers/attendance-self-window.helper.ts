import {
  CHECK_IN_OPENS_BEFORE_START_MINUTES,
  SELF_CHECK_IN_STATE,
  type SelfCheckInState,
} from '../constants/attendance.constants';
import type { AttendanceSelfRecord } from '../types/attendance.types';

const MINUTE_MS = 60_000;

export interface SelfCheckInResolution {
  readonly state: SelfCheckInState;
  /** Provisional open instant (UTC ISO); null once the server rules instead. */
  readonly opensAtIso: string | null;
  /** True when the state came from the client-side window, not the server. */
  readonly isProvisional: boolean;
}

/**
 * Resolve what the check-in card presents. The server's `selfCheckIn` block
 * (Wave B1) always wins; until it ships, a recorded mark still reads as
 * `recorded`, and the button only arms inside the provisional client window
 * `[startsAt − 60m, session end]` — flagged "subject to confirmation" because
 * the client cannot prove the rule the backend will enforce.
 */
export function resolveSelfCheckIn(
  record: AttendanceSelfRecord,
  startsAtIso: string,
  endsAtIso: string,
  nowIso: string,
): SelfCheckInResolution {
  if (record.selfCheckIn !== null) {
    return {
      state: record.selfCheckIn.state,
      opensAtIso: record.selfCheckIn.opensAtIso,
      isProvisional: false,
    };
  }
  if (record.status !== null) {
    return { state: SELF_CHECK_IN_STATE.recorded, opensAtIso: null, isProvisional: true };
  }
  const now = Date.parse(nowIso);
  const opensAt = Date.parse(startsAtIso) - CHECK_IN_OPENS_BEFORE_START_MINUTES * MINUTE_MS;
  if (now < opensAt) {
    return {
      state: SELF_CHECK_IN_STATE.notOpen,
      opensAtIso: new Date(opensAt).toISOString(),
      isProvisional: true,
    };
  }
  if (now > Date.parse(endsAtIso)) {
    return { state: SELF_CHECK_IN_STATE.closed, opensAtIso: null, isProvisional: true };
  }
  return { state: SELF_CHECK_IN_STATE.open, opensAtIso: null, isProvisional: true };
}
