import type { SchemaOutput } from '@/packages/schema';

import type {
  aliasResponseSchema,
  avatarAccessResponseSchema,
  memberDirectoryItemSchema,
  memberDirectoryListResponseSchema,
  memberHistoryResponseSchema,
  memberRolesResponseSchema,
  memberStatusEventResponseSchema,
  memberViewResponseSchema,
  membershipResponseSchema,
} from '../schemas/member.schema';
import type {
  AvatarAccess,
  MemberAlias,
  MemberDirectoryItem,
  MemberDirectoryPage,
  MemberProfile,
  MemberRoles,
  MemberStatusEvent,
  MembershipRecord,
} from '../types/members.types';

type DirectoryItemDto = SchemaOutput<typeof memberDirectoryItemSchema>;
type DirectoryListDto = SchemaOutput<typeof memberDirectoryListResponseSchema>;
type MemberViewDto = SchemaOutput<typeof memberViewResponseSchema>;
type MembershipDto = SchemaOutput<typeof membershipResponseSchema>;
type StatusEventDto = SchemaOutput<typeof memberStatusEventResponseSchema>;
type HistoryDto = SchemaOutput<typeof memberHistoryResponseSchema>;
type AliasDto = SchemaOutput<typeof aliasResponseSchema>;
type RolesDto = SchemaOutput<typeof memberRolesResponseSchema>;
type AvatarAccessDto = SchemaOutput<typeof avatarAccessResponseSchema>;

/** Exact directory row translated into the app's domain. */
export function mapMemberDirectoryItem(dto: DirectoryItemDto): MemberDirectoryItem {
  return {
    membershipId: dto.membershipId,
    teamId: dto.teamId,
    status: dto.status,
    displayName: dto.displayName,
    nickname: dto.nickname,
    jerseyNumber: dto.jerseyNumber,
    positions: dto.positions,
    hasAvatar: dto.hasAvatar,
  };
}

/** Exact bounded page translated into the app's pagination vocabulary. */
export function mapMemberDirectoryPage(dto: DirectoryListDto): MemberDirectoryPage {
  return {
    items: dto.items.map(mapMemberDirectoryItem),
    total: dto.total,
    pageSize: dto.limit,
    hasMore: dto.offset + dto.items.length < dto.total,
  };
}

/** Exact audience-shaped member view translated into the app's domain. */
export function mapMemberProfile(dto: MemberViewDto): MemberProfile {
  return {
    membershipId: dto.membershipId,
    teamId: dto.teamId,
    audience: dto.audience,
    status: dto.status,
    displayName: dto.displayName,
    nickname: dto.nickname,
    positions: dto.positions,
    jerseyNumber: dto.jerseyNumber,
    division: dto.division,
    hasAvatar: dto.hasAvatar,
    preferredName: dto.preferredName,
    fullNameAr: dto.fullNameAr,
    gender: dto.gender,
    fullName: dto.fullName,
    jerseySize: dto.jerseySize,
    email: dto.email,
    phone: dto.phone,
    heightCm: dto.heightCm,
    weightKg: dto.weightKg,
    ageClassification: dto.ageClassification,
    dateOfBirth: dto.dateOfBirth,
    statusReason: dto.statusReason,
    version: dto.version,
  };
}

/** Exact lifecycle result translated into the app's domain. */
export function mapMembershipRecord(dto: MembershipDto): MembershipRecord {
  return {
    id: dto.id,
    teamId: dto.teamId,
    status: dto.status,
    statusReason: dto.statusReason,
    statusEffectiveAtIso: dto.statusEffectiveAt,
    version: dto.version,
  };
}

/** Exact status-history event translated into the app's domain. */
export function mapMemberStatusEvent(dto: StatusEventDto): MemberStatusEvent {
  return {
    id: dto.id,
    fromStatus: dto.fromStatus,
    toStatus: dto.toStatus,
    reason: dto.reason,
    actorUserId: dto.actorUserId,
    occurredAtIso: dto.occurredAt,
  };
}

/** Exact history timeline translated, newest-first ordering preserved. */
export function mapMemberHistory(dto: HistoryDto): readonly MemberStatusEvent[] {
  return dto.items.map(mapMemberStatusEvent);
}

/** Exact alias translated into the app's domain. */
export function mapMemberAlias(dto: AliasDto): MemberAlias {
  return {
    id: dto.id,
    alias: dto.alias,
    source: dto.source,
    createdAtIso: dto.createdAt,
  };
}

/** Exact role assignment translated into the app's domain. */
export function mapMemberRoles(dto: RolesDto): MemberRoles {
  return {
    membershipId: dto.membershipId,
    roles: dto.roles,
    assignableRoles: dto.assignableRoles,
  };
}

/** Exact signed-avatar access translated into the app's domain. */
export function mapAvatarAccess(dto: AvatarAccessDto): AvatarAccess {
  return {
    url: dto.url,
    expiresAtIso: dto.expiresAt,
  };
}
