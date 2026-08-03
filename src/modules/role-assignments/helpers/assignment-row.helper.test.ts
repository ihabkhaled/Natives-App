import { describe, expect, it, vi } from 'vitest';

import { MOCK_ROLE_ASSIGNMENTS } from '@/tests/msw/role-assignments.fixture';

import type { RoleAssignment } from '../types/role-assignments.types';
import { buildAssignmentRowViews } from './assignment-row.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;
const formatInstant = (iso: string): string => `on ${iso}`;

function assignment(overrides: Partial<RoleAssignment> = {}): RoleAssignment {
  return { ...MOCK_ROLE_ASSIGNMENTS[0], ...overrides } as RoleAssignment;
}

function build(
  assignments: readonly RoleAssignment[],
  canRevoke = true,
  onRevoke: (id: string, message: string) => void = () => undefined,
): ReturnType<typeof buildAssignmentRowViews> {
  return buildAssignmentRowViews(t, formatInstant, assignments, { canRevoke, onRevoke });
}

describe('buildAssignmentRowViews', () => {
  it('puts the widest access first, then the most recent grant', () => {
    const rows = build(MOCK_ROLE_ASSIGNMENTS);

    // The platform-wide grant leads: an auditor reads the broadest access
    // first, and a grant made most recently is the likeliest mistake.
    expect(rows.map((row) => row.id)).toEqual([
      'assignment-3',
      'assignment-2',
      'assignment-1',
      'assignment-4',
    ]);
  });

  it('never offers to revoke a platform-wide grant from this screen', () => {
    const [row] = build([assignment({ id: 'p', teamId: null, seasonId: null })]);

    // Ending a platform grant is the audited super-admin flow; a second,
    // unguarded path would route around its last-administrator check.
    expect(row?.canRevoke).toBe(false);
  });

  it('offers nothing on an assignment the server already revoked', () => {
    const [row] = build([assignment({ revokedAt: '2026-03-01T09:00:00.000Z' })]);

    expect(row?.canRevoke).toBe(false);
  });

  it('withholds revoke entirely from a principal who may not act', () => {
    const [row] = build([assignment()], false);

    expect(row?.canRevoke).toBe(false);
  });

  it('names the person, the role and the scope in the confirmation sentence', () => {
    const [row] = build([assignment({ userId: 'user-9', roleKey: 'COACH', teamId: 'team-7' })]);

    // Nobody may confirm a revocation without reading whose access it ends.
    expect(row?.confirmMessage).toBe('user-9 · t:members.roleCoach · team-7');
  });

  it('labels a platform-wide scope rather than leaving it blank', () => {
    const [row] = build([assignment({ teamId: null, seasonId: null })]);

    // "no team" and "every team" look identical in an empty cell.
    expect(row?.scopeLabel).toBe('t:adminPlatform.navLabel');
  });

  it('appends the season when a grant is season-scoped', () => {
    const [row] = build([assignment({ teamId: 'team-1', seasonId: 'season-2026' })]);

    expect(row?.scopeLabel).toBe('team-1 · season-2026');
  });

  it('translates a role the client ships copy for', () => {
    const [row] = build([assignment({ roleKey: 'TEAM_ADMIN' })]);

    expect(row?.roleLabel).toBe('t:members.roleTeamAdmin');
  });

  it('humanizes a role the client has never seen instead of dropping it', () => {
    const [row] = build([assignment({ roleKey: 'PHYSIO_LEAD' })]);

    expect(row?.roleLabel).toBe('Physio Lead');
  });

  it('says a grant was seeded when no actor made it', () => {
    const [row] = build([assignment({ grantedBy: null })]);

    expect(row?.grantedByLabel).toBe('t:adminPlatform.grantedBySystem');
  });

  it('names the actor who made the grant when there is one', () => {
    const [row] = build([assignment({ grantedBy: 'admin-9' })]);

    expect(row?.grantedByLabel).toBe('t:adminPlatform.grantedByLabel:{"actor":"admin-9"}');
  });

  it('formats the effective-from instant through the caller’s formatter', () => {
    const [row] = build([assignment({ effectiveFrom: '2026-07-01T09:00:00.000Z' })]);

    expect(row?.sinceLabel).toBe(
      't:adminPlatform.sinceLabel:{"since":"on 2026-07-01T09:00:00.000Z"}',
    );
  });

  it('hands the assignment id and its own sentence to the revoke callback', () => {
    const onRevoke = vi.fn();
    const [row] = build([assignment({ id: 'assignment-9' })], true, onRevoke);

    row?.onRevoke();

    expect(onRevoke).toHaveBeenCalledWith('assignment-9', row?.confirmMessage);
  });

  it('leaves the caller’s array untouched while ordering', () => {
    const input = [...MOCK_ROLE_ASSIGNMENTS];
    build(input);

    expect(input).toEqual(MOCK_ROLE_ASSIGNMENTS);
  });
});
