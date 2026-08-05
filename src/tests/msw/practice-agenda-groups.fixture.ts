import type { PracticeAgenda } from '@/modules/practice-agenda';

import { MOCK_PRACTICE_AGENDA } from './practice-agenda.fixture';

type JsonObject = Record<string, unknown>;

interface MockGroupMember {
  readonly membershipId: string;
}

interface MockGroup {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
  readonly coachMembershipId: string | null;
  readonly position: number;
  readonly notes: string | null;
  readonly members: readonly MockGroupMember[];
}

/**
 * Two groups matching the `groupId`s already on `MOCK_PRACTICE_AGENDA`'s
 * stations, so the resolved plan actually shows a station next to the group
 * it belongs to rather than "Unassigned" for everything.
 */
const INITIAL_GROUPS: readonly MockGroup[] = [
  {
    id: 'group-1',
    name: 'Handlers',
    color: '#3b82f6',
    coachMembershipId: 'membership-3',
    position: 1,
    notes: 'Under-cut rotation.',
    members: [{ membershipId: 'membership-10' }, { membershipId: 'membership-11' }],
  },
  {
    id: 'group-2',
    name: 'Cutters',
    color: '#ef4444',
    coachMembershipId: null,
    position: 2,
    notes: null,
    members: [{ membershipId: 'membership-12' }],
  },
];

/** A canned "other session" agenda `copy` replaces the current one with. */
const COPIED_GROUPS: readonly MockGroup[] = [
  {
    id: 'group-copied-1',
    name: 'Copied squad',
    color: '#22c55e',
    coachMembershipId: null,
    position: 1,
    notes: null,
    members: [],
  },
];

let groups: MockGroup[] = INITIAL_GROUPS.map((group) => ({
  ...group,
  members: [...group.members],
}));
let nextGroupId = 1;

export function resetMockAgendaGroupsState(): void {
  groups = INITIAL_GROUPS.map((group) => ({ ...group, members: [...group.members] }));
  nextGroupId = 1;
}

function toResponseGroup(group: MockGroup): JsonObject {
  return { ...group, members: group.members.map((member) => ({ ...member })) };
}

/** The coach's own read: the plain agenda's blocks, plus the current groups. */
export function readMockAgendaGroupsPlan(): JsonObject {
  const agenda: PracticeAgenda = MOCK_PRACTICE_AGENDA;
  return { ...agenda, groups: groups.map(toResponseGroup) };
}

interface CreateGroupBody {
  readonly name?: string;
  readonly color?: string;
  readonly coachMembershipId?: string;
  readonly notes?: string;
}

export function createMockAgendaGroup(body: CreateGroupBody): JsonObject {
  const group: MockGroup = {
    id: `group-new-${String(nextGroupId)}`,
    name: body.name ?? '',
    color: body.color ?? null,
    coachMembershipId: body.coachMembershipId ?? null,
    position: groups.length + 1,
    notes: body.notes ?? null,
    members: [],
  };
  nextGroupId += 1;
  groups = [...groups, group];
  return toResponseGroup(group);
}

/** True when a group with that id existed and was removed. */
export function removeMockAgendaGroup(groupId: string): boolean {
  const before = groups.length;
  groups = groups.filter((group) => group.id !== groupId);
  return groups.length < before;
}

interface AssignMembersBody {
  readonly membershipIds?: readonly string[];
}

/** `null` when the group does not exist; the handler answers 404-worthy cases itself. */
export function assignMockGroupMembers(
  groupId: string,
  body: AssignMembersBody,
): JsonObject | null {
  const target = groups.find((group) => group.id === groupId);
  if (target === undefined) {
    return null;
  }
  const incoming = body.membershipIds ?? [];
  const existingIds = new Set(target.members.map((member) => member.membershipId));
  const merged = [
    ...target.members,
    ...incoming.filter((id) => !existingIds.has(id)).map((membershipId) => ({ membershipId })),
  ];
  groups = groups.map((group) => (group.id === groupId ? { ...group, members: merged } : group));
  const updated = groups.find((group) => group.id === groupId);
  return updated === undefined ? null : toResponseGroup(updated);
}

export function removeMockGroupMember(groupId: string, membershipId: string): JsonObject | null {
  const target = groups.find((group) => group.id === groupId);
  if (target === undefined) {
    return null;
  }
  groups = groups.map((group) =>
    group.id === groupId
      ? {
          ...group,
          members: group.members.filter((member) => member.membershipId !== membershipId),
        }
      : group,
  );
  const updated = groups.find((group) => group.id === groupId);
  return updated === undefined ? null : toResponseGroup(updated);
}

/**
 * Replace the current groups with a canned "other session"'s, and bump the
 * version the way a real copy would. The blocks are the plain agenda's own —
 * the mock does not model a second session's blocks, only the part this
 * module actually renders after a copy: the groups it left with.
 */
export function copyMockAgenda(): JsonObject {
  groups = COPIED_GROUPS.map((group) => ({ ...group, members: [...group.members] }));
  const agenda: PracticeAgenda = MOCK_PRACTICE_AGENDA;
  return {
    sessionId: agenda.sessionId,
    agendaId: agenda.agendaId,
    status: agenda.status,
    theme: agenda.theme,
    notes: agenda.notes,
    publishedAt: agenda.publishedAt,
    completedAt: agenda.completedAt,
    version: (agenda.version ?? 0) + 1,
  };
}
