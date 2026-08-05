import type { SchemaOutput } from '@/packages/schema';

import type {
  agendaGroupResponseSchema,
  agendaGroupsPlanResponseSchema,
  groupMemberResponseSchema,
} from '../schemas/practice-agenda-groups.schema';

export type GroupMember = SchemaOutput<typeof groupMemberResponseSchema>;
export type AgendaGroup = SchemaOutput<typeof agendaGroupResponseSchema>;
export type AgendaGroupsPlan = SchemaOutput<typeof agendaGroupsPlanResponseSchema>;

/** Which session's groups a request or command is about. */
export interface AgendaGroupsRequestParams {
  readonly teamId: string;
  readonly sessionId: string;
}

/**
 * A new group. `color`, `coachMembershipId` and `notes` are all optional on
 * the wire — `null` here means "leave it out of the request", not "send
 * null"; the gateway is what tells the two apart.
 */
export interface CreateGroupCommand extends AgendaGroupsRequestParams {
  readonly name: string;
  readonly color: string | null;
  readonly coachMembershipId: string | null;
  readonly notes: string | null;
}

export interface RemoveGroupCommand extends AgendaGroupsRequestParams {
  readonly groupId: string;
}

export interface AssignGroupMembersCommand extends AgendaGroupsRequestParams {
  readonly groupId: string;
  readonly membershipIds: readonly string[];
}

export interface RemoveGroupMemberCommand extends AgendaGroupsRequestParams {
  readonly groupId: string;
  readonly membershipId: string;
}

export interface CopyAgendaCommand extends AgendaGroupsRequestParams {
  readonly sourceSessionId: string;
}
