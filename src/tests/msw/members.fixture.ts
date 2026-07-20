import type { MemberRole } from '@/modules/members';

import {
  buildInitialMemberRecords,
  buildMemberRecord,
  MOCK_MEMBERS_TEAM_ID,
  type MemberAliasRecord,
  type MemberRecord,
  type MemberStatusEventRecord,
} from './members-data.fixture';

const NOW_ISO = '2026-07-19T10:00:00.000Z';
const AVATAR_BASE_URL = 'https://media.natives.local/members';

type JsonObject = Record<string, unknown>;

export type MemberTier = 'admin' | 'coach' | 'member';

export interface Actor {
  readonly tier: MemberTier;
  readonly userId: string;
}

const ASSIGNABLE_BY_TIER: Record<MemberTier, readonly MemberRole[]> = {
  admin: ['member', 'scorekeeper', 'analyst', 'coach', 'team_admin'],
  coach: ['member', 'scorekeeper', 'analyst'],
  member: [],
};

let records: MemberRecord[] = buildInitialMemberRecords();

export function resetMockMembersState(): void {
  records = buildInitialMemberRecords();
}

function find(membershipId: string): MemberRecord | undefined {
  return records.find((record) => record.membershipId === membershipId);
}

function audienceLabel(tier: MemberTier, isSelf: boolean): string {
  return isSelf ? 'self' : tier === 'member' ? 'teammate' : tier;
}

/** Gate one field on the viewer's tier without branching in the shaper. */
function gate<T>(allowed: boolean, value: T): T | null {
  return allowed ? value : null;
}

/** Shape a record into the audience-tiered MemberViewResponseDto. */
function shapeMemberView(record: MemberRecord, tier: MemberTier, isSelf: boolean): JsonObject {
  const one = isSelf || tier === 'admin' || tier === 'coach';
  const two = isSelf || tier === 'admin';
  return {
    membershipId: record.membershipId,
    teamId: record.teamId,
    audience: audienceLabel(tier, isSelf),
    status: record.status,
    displayName: record.displayName,
    nickname: record.nickname,
    positions: record.positions,
    jerseyNumber: record.jerseyNumber,
    division: record.division,
    hasAvatar: record.hasAvatar,
    preferredName: gate(one, record.preferredName),
    fullNameAr: gate(one, record.fullNameAr),
    gender: gate(one, record.gender),
    fullName: gate(one, record.fullName),
    jerseySize: gate(one, record.jerseySize),
    heightCm: gate(one, record.heightCm),
    weightKg: gate(one, record.weightKg),
    ageClassification: gate(one, record.ageClassification),
    dateOfBirth: gate(one, record.dateOfBirth),
    email: gate(two, record.email),
    phone: gate(two, record.phone),
    statusReason: gate(two, record.statusReason),
    createdBy: gate(two, 'user-1'),
    updatedBy: gate(two, 'user-1'),
    version: gate(two, record.version),
  };
}

function toMembership(record: MemberRecord): JsonObject {
  return {
    id: record.membershipId,
    teamId: record.teamId,
    seasonId: null,
    userId: record.selfUserId,
    status: record.status,
    statusReason: record.statusReason,
    statusEffectiveAt: NOW_ISO,
    joinedAt: NOW_ISO,
    leftAt: null,
    anonymizedAt: null,
    createdBy: 'user-1',
    updatedBy: 'user-1',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    version: record.version,
  };
}

function toAlias(alias: MemberAliasRecord): JsonObject {
  return {
    id: alias.id,
    membershipId: alias.id,
    alias: alias.alias,
    source: alias.source,
    createdAt: alias.createdAt,
  };
}

function toHistory(event: MemberStatusEventRecord, membershipId: string): JsonObject {
  return {
    id: event.id,
    membershipId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    reason: event.reason,
    actorUserId: event.actorUserId,
    effectiveAt: event.occurredAt,
    occurredAt: event.occurredAt,
  };
}

export function buildDirectoryResponse(limit: number, offset: number): JsonObject {
  const page = records.slice(offset, offset + limit);
  return {
    items: page.map((record) => ({
      membershipId: record.membershipId,
      teamId: record.teamId,
      status: record.status,
      displayName: record.displayName,
      nickname: record.nickname,
      jerseyNumber: record.jerseyNumber,
      positions: record.positions,
      hasAvatar: record.hasAvatar,
    })),
    total: records.length,
    limit,
    offset,
  };
}

export function getMemberView(
  membershipId: string,
  tier: MemberTier,
  actorUserId: string,
): JsonObject | null {
  const record = find(membershipId);
  return record === undefined
    ? null
    : shapeMemberView(record, tier, record.selfUserId === actorUserId);
}

export function inviteMemberRecord(
  fullName: string,
  nickname: string | null,
  jerseyNumber: number | null,
): JsonObject {
  const created = buildMemberRecord({
    membershipId: `mem-new-${String(records.length)}`,
    status: 'invited',
    displayName: fullName,
    fullName,
    nickname,
    jerseyNumber,
  });
  records = [...records, created];
  return toMembership(created);
}

export function transitionRecord(
  membershipId: string,
  status: MemberRecord['status'],
  reason: string | null,
): JsonObject | 'not-found' {
  const record = find(membershipId);
  if (record === undefined) {
    return 'not-found';
  }
  record.history.push({
    id: `${membershipId}-evt-${String(record.history.length + 1)}`,
    fromStatus: record.status,
    toStatus: status,
    reason,
    actorUserId: 'user-1',
    occurredAt: NOW_ISO,
  });
  record.status = status;
  record.statusReason = reason;
  record.version += 1;
  return toMembership(record);
}

interface ProfilePatch {
  readonly fullName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
  readonly expectedVersion: number;
}

export function updateProfileRecord(
  membershipId: string,
  patch: ProfilePatch,
  viewer: Actor,
): JsonObject | 'not-found' | 'conflict' {
  const record = find(membershipId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.version !== patch.expectedVersion) {
    return 'conflict';
  }
  record.displayName = patch.fullName;
  record.fullName = patch.fullName;
  record.nickname = patch.nickname;
  record.jerseyNumber = patch.jerseyNumber;
  record.version += 1;
  return shapeMemberView(record, viewer.tier, record.selfUserId === viewer.userId);
}

export function listAliasesResponse(membershipId: string): JsonObject {
  const record = find(membershipId);
  return { items: (record?.aliases ?? []).map(toAlias) };
}

export function addAliasRecord(membershipId: string, alias: string): JsonObject | 'conflict' {
  const record = find(membershipId);
  if (record === undefined) {
    return 'conflict';
  }
  const exists = record.aliases.some((entry) => entry.alias.toLowerCase() === alias.toLowerCase());
  if (exists) {
    return 'conflict';
  }
  const created: MemberAliasRecord = {
    id: `alias-${membershipId}-${String(record.aliases.length + 1)}`,
    alias,
    source: 'manual',
    createdAt: NOW_ISO,
  };
  record.aliases.push(created);
  return toAlias(created);
}

export function removeAliasRecord(membershipId: string, aliasId: string): boolean {
  const record = find(membershipId);
  if (record === undefined) {
    return false;
  }
  record.aliases = record.aliases.filter((entry) => entry.id !== aliasId);
  return true;
}

export function rolesResponse(membershipId: string, tier: MemberTier): JsonObject {
  const record = find(membershipId);
  return {
    membershipId,
    roles: record?.roles ?? [],
    assignableRoles: ASSIGNABLE_BY_TIER[tier],
  };
}

export function setRolesRecord(
  membershipId: string,
  roles: readonly MemberRole[],
  tier: MemberTier,
): JsonObject {
  const record = find(membershipId);
  if (record !== undefined) {
    record.roles = roles;
  }
  return rolesResponse(membershipId, tier);
}

export function avatarTicketResponse(membershipId: string): JsonObject {
  return {
    mediaId: `media-${membershipId}`,
    storageKey: `${MOCK_MEMBERS_TEAM_ID}/${membershipId}.png`,
    uploadUrl: `${AVATAR_BASE_URL}/upload/${membershipId}`,
    expiresAt: NOW_ISO,
  };
}

export function attachAvatarRecord(
  membershipId: string,
  tier: MemberTier,
  actorUserId: string,
): JsonObject | 'not-found' {
  const record = find(membershipId);
  if (record === undefined) {
    return 'not-found';
  }
  record.hasAvatar = true;
  return shapeMemberView(record, tier, record.selfUserId === actorUserId);
}

export function avatarAccessResponse(membershipId: string): JsonObject {
  const record = find(membershipId);
  return record?.hasAvatar === true
    ? { url: `${AVATAR_BASE_URL}/${membershipId}.png`, expiresAt: NOW_ISO }
    : { url: null, expiresAt: null };
}

export function historyResponse(membershipId: string): JsonObject {
  const record = find(membershipId);
  const events = [...(record?.history ?? [])].reverse();
  return { items: events.map((event) => toHistory(event, membershipId)) };
}
