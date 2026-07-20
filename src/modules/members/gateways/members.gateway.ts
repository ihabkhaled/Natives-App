import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  memberAliasPath,
  memberAliasesPath,
  memberAvatarAttachPath,
  memberAvatarPath,
  memberHistoryPath,
  memberInvitePath,
  memberPath,
  memberProfilePath,
  memberRolesPath,
  memberTransitionPath,
  membersPath,
} from '../constants/members-api.constants';
import {
  aliasListResponseSchema,
  aliasResponseSchema,
  avatarAccessResponseSchema,
  avatarTicketResponseSchema,
  memberDirectoryListResponseSchema,
  memberHistoryResponseSchema,
  memberRolesResponseSchema,
  memberViewResponseSchema,
  membershipResponseSchema,
} from '../schemas/member.schema';
import type { InviteMemberInput, UpdateProfileInput } from '../types/members.types';

type DirectoryListDto = SchemaOutput<typeof memberDirectoryListResponseSchema>;
type MemberViewDto = SchemaOutput<typeof memberViewResponseSchema>;
type MembershipDto = SchemaOutput<typeof membershipResponseSchema>;
type HistoryDto = SchemaOutput<typeof memberHistoryResponseSchema>;
type AliasDto = SchemaOutput<typeof aliasResponseSchema>;
type AliasListDto = SchemaOutput<typeof aliasListResponseSchema>;
type RolesDto = SchemaOutput<typeof memberRolesResponseSchema>;
type AvatarTicketDto = SchemaOutput<typeof avatarTicketResponseSchema>;
type AvatarAccessDto = SchemaOutput<typeof avatarAccessResponseSchema>;

function buildProfileBody(input: InviteMemberInput | UpdateProfileInput): Record<string, unknown> {
  return {
    fullName: input.fullName,
    ...(input.nickname === null ? {} : { nickname: input.nickname }),
    ...(input.jerseyNumber === null ? {} : { jerseyNumber: input.jerseyNumber }),
  };
}

/** One bounded, deterministically ordered directory page. */
export function requestMemberDirectory(
  teamId: string,
  limit: number,
  offset: number,
): Promise<DirectoryListDto> {
  return getAppHttpClient().get(membersPath(teamId), memberDirectoryListResponseSchema, {
    params: { limit, offset },
  });
}

/** One audience-shaped member view, schema-parsed. */
export function requestMember(teamId: string, membershipId: string): Promise<MemberViewDto> {
  return getAppHttpClient().get(memberPath(teamId, membershipId), memberViewResponseSchema);
}

/** Invite a person into the team; the server returns the new membership. */
export function requestInviteMember(
  teamId: string,
  input: InviteMemberInput,
): Promise<MembershipDto> {
  return getAppHttpClient().post(
    memberInvitePath(teamId),
    { profile: buildProfileBody(input) },
    membershipResponseSchema,
  );
}

/** Update a profile with optimistic concurrency; returns the reshaped view. */
export function requestUpdateProfile(
  teamId: string,
  membershipId: string,
  input: UpdateProfileInput,
): Promise<MemberViewDto> {
  return getAppHttpClient().patch(
    memberProfilePath(teamId, membershipId),
    { profile: buildProfileBody(input), expectedVersion: input.expectedVersion },
    memberViewResponseSchema,
  );
}

/** Run a named lifecycle transition; returns the authoritative membership. */
export function requestTransition(
  teamId: string,
  membershipId: string,
  endpoint: string,
  reason: string | null,
): Promise<MembershipDto> {
  return getAppHttpClient().post(
    memberTransitionPath(teamId, membershipId, endpoint),
    reason === null ? {} : { reason },
    membershipResponseSchema,
  );
}

/** The append-only status-history timeline. */
export function requestMemberHistory(teamId: string, membershipId: string): Promise<HistoryDto> {
  return getAppHttpClient().get(
    memberHistoryPath(teamId, membershipId),
    memberHistoryResponseSchema,
  );
}

/** A member's active aliases. */
export function requestMemberAliases(teamId: string, membershipId: string): Promise<AliasListDto> {
  return getAppHttpClient().get(memberAliasesPath(teamId, membershipId), aliasListResponseSchema);
}

/** Add one alias; the server returns the created alias. */
export function requestAddAlias(
  teamId: string,
  membershipId: string,
  alias: string,
): Promise<AliasDto> {
  return getAppHttpClient().post(
    memberAliasesPath(teamId, membershipId),
    { alias },
    aliasResponseSchema,
  );
}

/** Remove one alias. */
export function requestRemoveAlias(
  teamId: string,
  membershipId: string,
  aliasId: string,
): Promise<void> {
  return getAppHttpClient().delete(memberAliasPath(teamId, membershipId, aliasId));
}

/** A member's roles plus the roles the actor may assign (privilege ceiling). */
export function requestMemberRoles(teamId: string, membershipId: string): Promise<RolesDto> {
  return getAppHttpClient().get(memberRolesPath(teamId, membershipId), memberRolesResponseSchema);
}

/** Replace a member's role set; returns the reconciled roles + ceiling. */
export function requestAssignRoles(
  teamId: string,
  membershipId: string,
  roles: readonly string[],
): Promise<RolesDto> {
  return getAppHttpClient().put(
    memberRolesPath(teamId, membershipId),
    { roles },
    memberRolesResponseSchema,
  );
}

/** Request a short-lived signed avatar upload ticket. */
export function requestAvatarTicket(
  teamId: string,
  membershipId: string,
  contentType: string,
  byteSize: number,
): Promise<AvatarTicketDto> {
  return getAppHttpClient().post(
    memberAvatarPath(teamId, membershipId),
    { contentType, byteSize },
    avatarTicketResponseSchema,
  );
}

/** Attach a scanned-clean avatar; returns the reshaped member view. */
export function requestAttachAvatar(
  teamId: string,
  membershipId: string,
  mediaId: string,
): Promise<MemberViewDto> {
  return getAppHttpClient().put(
    memberAvatarAttachPath(teamId, membershipId, mediaId),
    {},
    memberViewResponseSchema,
  );
}

/** A signed avatar download URL, or a null URL when none exists. */
export function requestAvatarAccess(
  teamId: string,
  membershipId: string,
): Promise<AvatarAccessDto> {
  return getAppHttpClient().get(memberAvatarPath(teamId, membershipId), avatarAccessResponseSchema);
}
