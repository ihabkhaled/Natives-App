import { getAppHttpClient } from '@/packages/http';
import { agendaSummaryResponseSchema, type AgendaSummary } from '@/modules/practice-agenda';

import {
  agendaCopyPath,
  agendaGroupMemberPath,
  agendaGroupMembersPath,
  agendaGroupPath,
  agendaGroupsPath,
  agendaGroupsPlanPath,
} from '../constants/practice-agenda-groups-api.constants';
import {
  agendaGroupResponseSchema,
  agendaGroupsPlanResponseSchema,
} from '../schemas/practice-agenda-groups.schema';
import type {
  AgendaGroup,
  AgendaGroupsPlan,
  AgendaGroupsRequestParams,
  AssignGroupMembersCommand,
  CopyAgendaCommand,
  CreateGroupCommand,
  RemoveGroupCommand,
  RemoveGroupMemberCommand,
} from '../types/practice-agenda-groups.types';

/** The coach's own read: blocks, stations and groups, with private coach notes. */
export function requestAgendaGroupsPlan(
  params: AgendaGroupsRequestParams,
): Promise<AgendaGroupsPlan> {
  return getAppHttpClient().get(
    agendaGroupsPlanPath(params.teamId, params.sessionId),
    agendaGroupsPlanResponseSchema,
  );
}

/**
 * Replace this agenda with another session's rather than rebuilding it block
 * by block. The answer is the header only — no blocks, no groups — so the
 * caller re-reads the plan to see what actually landed.
 */
export function requestAgendaCopy(command: CopyAgendaCommand): Promise<AgendaSummary> {
  return getAppHttpClient().post(
    agendaCopyPath(command.teamId, command.sessionId),
    { sourceSessionId: command.sourceSessionId },
    agendaSummaryResponseSchema,
  );
}

/** Every optional field is left out of the body rather than sent as null. */
function toCreateGroupBody(command: CreateGroupCommand): Record<string, unknown> {
  return {
    name: command.name,
    ...(command.color === null ? {} : { color: command.color }),
    ...(command.coachMembershipId === null ? {} : { coachMembershipId: command.coachMembershipId }),
    ...(command.notes === null ? {} : { notes: command.notes }),
  };
}

export function requestCreateGroup(command: CreateGroupCommand): Promise<AgendaGroup> {
  return getAppHttpClient().post(
    agendaGroupsPath(command.teamId, command.sessionId),
    toCreateGroupBody(command),
    agendaGroupResponseSchema,
  );
}

/** The server answers 204; the refreshed plan is what proves the group is gone. */
export function requestRemoveGroup(command: RemoveGroupCommand): Promise<void> {
  return getAppHttpClient().delete(
    agendaGroupPath(command.teamId, command.sessionId, command.groupId),
  );
}

export function requestAssignGroupMembers(
  command: AssignGroupMembersCommand,
): Promise<AgendaGroup> {
  return getAppHttpClient().post(
    agendaGroupMembersPath(command.teamId, command.sessionId, command.groupId),
    { membershipIds: command.membershipIds },
    agendaGroupResponseSchema,
  );
}

/**
 * The server answers 200 with the updated group, but the client parses
 * nothing from a delete response — `HttpClient.delete` never parses a body,
 * by the same discipline every other removal in this codebase follows. The
 * refreshed plan after invalidation is the group's new membership list.
 */
export function requestRemoveGroupMember(command: RemoveGroupMemberCommand): Promise<void> {
  return getAppHttpClient().delete(
    agendaGroupMemberPath(command.teamId, command.sessionId, command.groupId, command.membershipId),
  );
}
