import type { BackendApiSchemas } from '@/packages/api-contract';
import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  attendanceCheckInPath,
  attendanceParticipationSelfPath,
  attendanceSelfPath,
} from '../constants/attendance-api.constants';
import {
  attendanceSelfRecordSchema,
  participationResponseSchema,
} from '../schemas/attendance-self.schema';

type SelfRecordDto = SchemaOutput<typeof attendanceSelfRecordSchema>;
type ParticipationDto = SchemaOutput<typeof participationResponseSchema>;

/** The caller's own record for one session — never anyone else's. */
export function requestMyAttendance(teamId: string, sessionId: string): Promise<SelfRecordDto> {
  return getAppHttpClient().get(attendanceSelfPath(teamId, sessionId), attendanceSelfRecordSchema);
}

/** Self check-in; the backend derives on-time/late from its own clock. */
export function requestSelfCheckIn(
  teamId: string,
  sessionId: string,
  note: string | null,
): Promise<SelfRecordDto> {
  const body: BackendApiSchemas['SelfCheckInDto'] = note === null ? {} : { note };
  return getAppHttpClient().post(
    attendanceCheckInPath(teamId, sessionId),
    body,
    attendanceSelfRecordSchema,
  );
}

/** Own participation summary; the optional season narrows the window. */
export function requestMyParticipation(
  teamId: string,
  seasonId: string | null,
): Promise<ParticipationDto> {
  return getAppHttpClient().get(
    attendanceParticipationSelfPath(teamId),
    participationResponseSchema,
    { params: seasonId === null ? {} : { seasonId } },
  );
}
