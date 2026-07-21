import { MOCK_PRACTICE } from './mock-data.constants';

/** The team every mock persona belongs to, in the teams contract's shape. */
export const MOCK_TEAM = {
  id: MOCK_PRACTICE.teamId,
  slug: 'cairo-natives',
  name: 'Cairo Natives',
  locale: 'en',
  timezone: 'Africa/Cairo',
  primaryColor: '#000000',
  logoMediaKey: null,
  status: 'active',
  createdBy: 'user-admin',
  updatedBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
} as const;

/** A second team, so the multi-team switcher has something to switch to. */
export const MOCK_SECOND_TEAM = {
  ...MOCK_TEAM,
  id: 'team-reserve',
  slug: 'natives-reserve',
  name: 'Natives Reserve',
  status: 'disabled',
  version: 2,
} as const;

export const MOCK_SEASON = {
  id: 'season-2026-spring',
  teamId: MOCK_TEAM.id,
  slug: 'spring-2026',
  name: 'Spring 2026',
  startsOn: '2026-01-01',
  endsOn: '2026-06-30',
  status: 'active',
  createdBy: 'user-admin',
  updatedBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
} as const;

export const MOCK_DRAFT_SEASON = {
  ...MOCK_SEASON,
  id: 'season-2026-autumn',
  slug: 'autumn-2026',
  name: 'Autumn 2026',
  startsOn: '2026-09-01',
  endsOn: '2026-12-31',
  status: 'draft',
} as const;

/**
 * The seeded role x permission matrix, trimmed to the shape the screen reads.
 * Enough rows to prove the grid, the area filter, and the granted marks.
 */
export const MOCK_ROLE_MATRIX = {
  policyVersion: 5,
  permissions: [
    { key: 'member.list', area: 'members', description: 'List members' },
    { key: 'member.roles.manage', area: 'members', description: 'Manage member roles' },
    { key: 'practice.read', area: 'practices', description: 'View practices' },
    { key: 'practice.manage', area: 'practices', description: 'Manage practices' },
  ],
  roles: [
    {
      key: 'MEMBER',
      displayName: 'Member',
      description: 'Everyday player access',
      isSystem: true,
      permissions: ['practice.read'],
    },
    {
      key: 'TEAM_ADMIN',
      displayName: 'Team administrator',
      description: 'Full team administration',
      isSystem: true,
      permissions: ['member.list', 'member.roles.manage', 'practice.read', 'practice.manage'],
    },
  ],
} as const;
