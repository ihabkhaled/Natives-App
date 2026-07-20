import type {
  AgeClassification,
  MemberRole,
  MembershipStatus,
  PlayerGender,
} from '@/modules/members';

import { MOCK_PRACTICE } from './mock-data.constants';

export const MOCK_MEMBERS_TEAM_ID = MOCK_PRACTICE.teamId;

export interface MemberAliasRecord {
  id: string;
  alias: string;
  source: 'manual' | 'import';
  createdAt: string;
}

export interface MemberStatusEventRecord {
  id: string;
  fromStatus: MembershipStatus | null;
  toStatus: MembershipStatus;
  reason: string | null;
  actorUserId: string | null;
  occurredAt: string;
}

export interface MemberRecord {
  membershipId: string;
  teamId: string;
  status: MembershipStatus;
  displayName: string;
  nickname: string | null;
  jerseyNumber: number | null;
  positions: readonly string[];
  hasAvatar: boolean;
  fullName: string | null;
  preferredName: string | null;
  fullNameAr: string | null;
  gender: PlayerGender | null;
  division: string | null;
  jerseySize: string | null;
  email: string | null;
  phone: string | null;
  heightCm: number | null;
  weightKg: number | null;
  ageClassification: AgeClassification | null;
  dateOfBirth: string | null;
  statusReason: string | null;
  version: number;
  roles: readonly MemberRole[];
  aliases: MemberAliasRecord[];
  history: MemberStatusEventRecord[];
  /** The auth user id whose "self" profile this membership is, or null. */
  selfUserId: string | null;
}

const EPOCH = '2026-05-01T09:00:00.000Z';

export function buildMemberRecord(
  overrides: Partial<MemberRecord> & Pick<MemberRecord, 'membershipId' | 'displayName' | 'status'>,
): MemberRecord {
  return {
    teamId: MOCK_MEMBERS_TEAM_ID,
    nickname: null,
    jerseyNumber: null,
    positions: [],
    hasAvatar: false,
    fullName: null,
    preferredName: null,
    fullNameAr: null,
    gender: null,
    division: null,
    jerseySize: null,
    email: null,
    phone: null,
    heightCm: null,
    weightKg: null,
    ageClassification: null,
    dateOfBirth: null,
    statusReason: null,
    version: 1,
    roles: ['member'],
    aliases: [],
    history: [
      {
        id: `${overrides.membershipId}-evt-1`,
        fromStatus: null,
        toStatus: overrides.status,
        reason: null,
        actorUserId: 'user-1',
        occurredAt: EPOCH,
      },
    ],
    selfUserId: null,
    ...overrides,
  };
}

/** The three "self" members mapped to the mock personas (admin/coach/member). */
function buildPersonaMemberRecords(): MemberRecord[] {
  return [
    buildMemberRecord({
      membershipId: 'mem-omar',
      displayName: 'Omar Hassan',
      status: 'active',
      nickname: 'Omo',
      jerseyNumber: 7,
      positions: ['handler', 'cutter'],
      hasAvatar: true,
      fullName: 'Omar Hassan',
      preferredName: 'Omar',
      gender: 'man',
      division: 'open',
      jerseySize: 'L',
      email: 'omar@example.com',
      phone: '+201000000007',
      heightCm: 182,
      weightKg: 78,
      ageClassification: 'senior',
      dateOfBirth: '1998-03-14',
      aliases: [{ id: 'alias-omar-1', alias: 'O-Train', source: 'manual', createdAt: EPOCH }],
      selfUserId: 'user-member',
    }),
    buildMemberRecord({
      membershipId: 'mem-nadia',
      displayName: 'Coach Nadia',
      status: 'active',
      positions: ['coach'],
      fullName: 'Nadia Fahmy',
      gender: 'woman',
      roles: ['member', 'coach'],
      selfUserId: 'user-coach',
    }),
    buildMemberRecord({
      membershipId: 'mem-admin',
      displayName: 'Admin Ranger',
      status: 'active',
      jerseyNumber: 1,
      positions: ['handler'],
      fullName: 'Ranger One',
      roles: ['member', 'coach', 'team_admin'],
      selfUserId: 'user-1',
    }),
  ];
}

/** Roster members spanning every lifecycle status for filter coverage. */
function buildRosterMemberRecords(): MemberRecord[] {
  return [
    buildMemberRecord({
      membershipId: 'mem-sara',
      displayName: 'Sara Adel',
      status: 'invited',
      jerseyNumber: 12,
      positions: ['cutter', 'deep'],
    }),
    buildMemberRecord({
      membershipId: 'mem-ali',
      displayName: 'Ali Mostafa',
      status: 'suspended',
      jerseyNumber: 3,
      positions: ['handler'],
      statusReason: 'Code of conduct review',
    }),
    buildMemberRecord({
      membershipId: 'mem-lina',
      displayName: 'Lina Yousry',
      status: 'inactive',
      jerseyNumber: 9,
      positions: ['deep'],
    }),
    buildMemberRecord({
      membershipId: 'mem-zed',
      displayName: 'Zeyad Kamal',
      status: 'left',
      jerseyNumber: 21,
      positions: ['cutter'],
    }),
    buildMemberRecord({
      membershipId: 'mem-mai',
      displayName: 'Mai Salah',
      status: 'archived',
      jerseyNumber: 5,
      positions: ['handler'],
    }),
  ];
}

/** Fresh deterministic roster; every reset rebuilds independent copies. */
export function buildInitialMemberRecords(): MemberRecord[] {
  return [...buildPersonaMemberRecords(), ...buildRosterMemberRecords()];
}
