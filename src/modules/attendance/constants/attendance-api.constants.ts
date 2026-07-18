const TEAMS_PATH = '/teams';
const PRACTICE_SESSIONS_SEGMENT = 'practice-sessions';
const ATTENDANCE_SEGMENT = 'attendance';

function attendanceBasePath(teamId: string, sessionId: string): string {
  return `${TEAMS_PATH}/${encodeURIComponent(teamId)}/${PRACTICE_SESSIONS_SEGMENT}/${encodeURIComponent(sessionId)}/${ATTENDANCE_SEGMENT}`;
}

export function attendanceRosterPath(teamId: string, sessionId: string): string {
  return attendanceBasePath(teamId, sessionId);
}

export function attendanceMemberPath(
  teamId: string,
  sessionId: string,
  membershipId: string,
): string {
  return `${attendanceBasePath(teamId, sessionId)}/${encodeURIComponent(membershipId)}`;
}

export function attendanceCorrectionPath(
  teamId: string,
  sessionId: string,
  membershipId: string,
): string {
  return `${attendanceMemberPath(teamId, sessionId, membershipId)}/correction`;
}

export function attendanceHistoryPath(
  teamId: string,
  sessionId: string,
  membershipId: string,
): string {
  return `${attendanceMemberPath(teamId, sessionId, membershipId)}/history`;
}

export function attendanceBulkPath(teamId: string, sessionId: string): string {
  return `${attendanceBasePath(teamId, sessionId)}/bulk`;
}

export function attendanceFinalizePath(teamId: string, sessionId: string): string {
  return `${attendanceBasePath(teamId, sessionId)}/finalize`;
}
