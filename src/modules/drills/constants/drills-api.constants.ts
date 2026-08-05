/** NestJS drill-catalogue endpoints, relative to the versioned API base URL. */
const DRILLS_API_PATHS = {
  teams: '/teams',
  drills: 'drills',
  archive: 'archive',
} as const;

function drillsBasePath(teamId: string): string {
  return `${DRILLS_API_PATHS.teams}/${encodeURIComponent(teamId)}/${DRILLS_API_PATHS.drills}`;
}

/** The team's bounded drill list; also the create-drill target (`POST`). */
export function drillsListPath(teamId: string): string {
  return drillsBasePath(teamId);
}

/** One drill: `GET` to read, `PATCH` to update. */
export function drillPath(teamId: string, drillId: string): string {
  return `${drillsBasePath(teamId)}/${encodeURIComponent(drillId)}`;
}

/**
 * Retire a drill. Never a delete: past agendas keep referencing this id, so
 * the endpoint flips `status` rather than removing the record.
 */
export function drillArchivePath(teamId: string, drillId: string): string {
  return `${drillPath(teamId, drillId)}/${DRILLS_API_PATHS.archive}`;
}
