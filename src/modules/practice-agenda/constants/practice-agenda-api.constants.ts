/** Practice-agenda paths, relative to the versioned API base URL. */
function sessionPath(teamId: string, sessionId: string): string {
  return `/teams/${encodeURIComponent(teamId)}/practice-sessions/${encodeURIComponent(sessionId)}`;
}

/** The whole agenda: blocks with their stations nested, in one read. */
export function practiceAgendaResourcePath(teamId: string, sessionId: string): string {
  return `${sessionPath(teamId, sessionId)}/agenda`;
}

/** The batch reorder command; the server answers with the new agenda version. */
export function practiceAgendaReorderPath(teamId: string, sessionId: string): string {
  return `${practiceAgendaResourcePath(teamId, sessionId)}/blocks/reorder`;
}

/** One station under one block. */
export function practiceAgendaStationPath(
  teamId: string,
  sessionId: string,
  blockId: string,
  stationId: string,
): string {
  const blocks = `${practiceAgendaResourcePath(teamId, sessionId)}/blocks`;
  return `${blocks}/${encodeURIComponent(blockId)}/stations/${encodeURIComponent(stationId)}`;
}
