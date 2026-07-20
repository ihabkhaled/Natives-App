/** NestJS member endpoints, relative to the versioned API base URL. */
const MEMBERS_API_PATHS = {
  teams: '/teams',
} as const;

/** Team-scoped member collection path. */
export function membersPath(teamId: string): string {
  return `${MEMBERS_API_PATHS.teams}/${encodeURIComponent(teamId)}/members`;
}

/** Invite path for a team. */
export function memberInvitePath(teamId: string): string {
  return `${membersPath(teamId)}/invite`;
}

/** Single member view path. */
export function memberPath(teamId: string, membershipId: string): string {
  return `${membersPath(teamId)}/${encodeURIComponent(membershipId)}`;
}

/** Self/admin profile update path. */
export function memberProfilePath(teamId: string, membershipId: string): string {
  return `${memberPath(teamId, membershipId)}/profile`;
}

/** Lifecycle transition path for a named action (activate/suspend/…). */
export function memberTransitionPath(teamId: string, membershipId: string, action: string): string {
  return `${memberPath(teamId, membershipId)}/${action}`;
}

/** Append-only status-history timeline path. */
export function memberHistoryPath(teamId: string, membershipId: string): string {
  return `${memberPath(teamId, membershipId)}/history`;
}

/** Alias collection path. */
export function memberAliasesPath(teamId: string, membershipId: string): string {
  return `${memberPath(teamId, membershipId)}/aliases`;
}

/** Single alias path. */
export function memberAliasPath(teamId: string, membershipId: string, aliasId: string): string {
  return `${memberAliasesPath(teamId, membershipId)}/${encodeURIComponent(aliasId)}`;
}

/** Signed avatar upload-ticket / access path. */
export function memberAvatarPath(teamId: string, membershipId: string): string {
  return `${memberPath(teamId, membershipId)}/avatar`;
}

/** Attach-a-scanned-avatar path for one media id. */
export function memberAvatarAttachPath(
  teamId: string,
  membershipId: string,
  mediaId: string,
): string {
  return `${memberAvatarPath(teamId, membershipId)}/${encodeURIComponent(mediaId)}`;
}

/** Role assignment path (roles read + write). */
export function memberRolesPath(teamId: string, membershipId: string): string {
  return `${memberPath(teamId, membershipId)}/roles`;
}
