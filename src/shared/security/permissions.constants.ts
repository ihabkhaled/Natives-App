/**
 * Canonical permission catalog. Permissions are strings, never role names;
 * navigation and route guards reason about these values so a persona's shell
 * follows its effective grants rather than a hard-coded role column.
 *
 * Mirrors 02-PRODUCT/rbac-permission-matrix.md. The backend remains the sole
 * authority: these strings gate convenience UI only, never authorization.
 */
export const PERMISSIONS = {
  usersManage: 'users.manage',
  membersRead: 'members.read',
  membersManage: 'members.manage',
  practicesRead: 'practices.read',
  practicesManage: 'practices.manage',
  attendanceMark: 'attendance.mark',
  assessmentsManage: 'assessments.manage',
  leaderboardsRead: 'leaderboards.read',
  matchesScore: 'matches.score',
  reportsGenerate: 'reports.generate',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
