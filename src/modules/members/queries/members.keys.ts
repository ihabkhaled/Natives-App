import type { MembersQueryParams } from '../types/members.types';

/** Stable query-key builders for the members cache. */
export const membersQueryKeys = {
  all: ['members'] as const,
  team: (teamId: string) => [...membersQueryKeys.all, 'team', teamId] as const,
  directory: (teamId: string, params: MembersQueryParams) =>
    [...membersQueryKeys.team(teamId), 'directory', params] as const,
  member: (teamId: string, membershipId: string) =>
    [...membersQueryKeys.team(teamId), 'member', membershipId] as const,
  history: (teamId: string, membershipId: string) =>
    [...membersQueryKeys.member(teamId, membershipId), 'history'] as const,
  aliases: (teamId: string, membershipId: string) =>
    [...membersQueryKeys.member(teamId, membershipId), 'aliases'] as const,
  roles: (teamId: string, membershipId: string) =>
    [...membersQueryKeys.member(teamId, membershipId), 'roles'] as const,
  avatar: (teamId: string, membershipId: string) =>
    [...membersQueryKeys.member(teamId, membershipId), 'avatar'] as const,
  assignableRoles: (teamId: string) =>
    [...membersQueryKeys.team(teamId), 'assignable-roles'] as const,
};
