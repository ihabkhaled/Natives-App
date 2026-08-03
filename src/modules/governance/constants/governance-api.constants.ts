/** Governance paths, relative to the versioned API base URL. */
function governancePath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}/governance${suffix}`;
}

export function governanceMeetingsPath(teamId: string): string {
  return governancePath(teamId, '/meetings');
}

export function governanceMeetingPath(teamId: string, meetingId: string): string {
  return `${governanceMeetingsPath(teamId)}/${encodeURIComponent(meetingId)}`;
}

export function governanceTasksPath(teamId: string): string {
  return governancePath(teamId, '/tasks');
}

export function governanceTaskPath(teamId: string, taskId: string): string {
  return `${governanceTasksPath(teamId)}/${encodeURIComponent(taskId)}`;
}
