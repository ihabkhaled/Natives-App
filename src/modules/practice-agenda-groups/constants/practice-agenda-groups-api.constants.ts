/** NestJS practice-agenda-groups endpoints, relative to the versioned API base URL. */
function sessionPath(teamId: string, sessionId: string): string {
  return `/teams/${encodeURIComponent(teamId)}/practice-sessions/${encodeURIComponent(sessionId)}`;
}

function agendaPath(teamId: string, sessionId: string): string {
  return `${sessionPath(teamId, sessionId)}/agenda`;
}

/** The coach's own read: same wire shape as the plain agenda, plus groups and coach notes. */
export function agendaGroupsPlanPath(teamId: string, sessionId: string): string {
  return `${agendaPath(teamId, sessionId)}/plan`;
}

/** Replace this agenda with another session's, rather than rebuilding it block by block. */
export function agendaCopyPath(teamId: string, sessionId: string): string {
  return `${agendaPath(teamId, sessionId)}/copy`;
}

/** The group collection: create posts here, and the plan's `groups` array lists it. */
export function agendaGroupsPath(teamId: string, sessionId: string): string {
  return `${agendaPath(teamId, sessionId)}/groups`;
}

/** One group by id. */
export function agendaGroupPath(teamId: string, sessionId: string, groupId: string): string {
  return `${agendaGroupsPath(teamId, sessionId)}/${encodeURIComponent(groupId)}`;
}

/** A group's membership collection: assigning members posts here. */
export function agendaGroupMembersPath(teamId: string, sessionId: string, groupId: string): string {
  return `${agendaGroupPath(teamId, sessionId, groupId)}/members`;
}

/** One membership inside one group. */
export function agendaGroupMemberPath(
  teamId: string,
  sessionId: string,
  groupId: string,
  membershipId: string,
): string {
  return `${agendaGroupMembersPath(teamId, sessionId, groupId)}/${encodeURIComponent(membershipId)}`;
}
