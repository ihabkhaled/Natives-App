import { describe, expect, it } from 'vitest';

import { MEMBER_ROLE } from '../constants/members.constants';
import { buildRoleToggles, rolesDiffer, toggleRole } from './role-toggle.helper';

const t = (key: string): string => key;
const assignable = [MEMBER_ROLE.member, MEMBER_ROLE.coach];

describe('role-toggle.helper', () => {
  it('adds and removes an assignable role', () => {
    expect(toggleRole([], MEMBER_ROLE.coach, assignable)).toEqual([MEMBER_ROLE.coach]);
    expect(toggleRole([MEMBER_ROLE.coach], MEMBER_ROLE.coach, assignable)).toEqual([]);
  });

  it('ignores a role above the ceiling', () => {
    expect(toggleRole([], MEMBER_ROLE.teamAdmin, assignable)).toEqual([]);
  });

  it('detects differing role sets', () => {
    expect(rolesDiffer([MEMBER_ROLE.member], [])).toBe(true);
    expect(rolesDiffer([MEMBER_ROLE.member], [MEMBER_ROLE.coach])).toBe(true);
    expect(rolesDiffer([MEMBER_ROLE.member], [MEMBER_ROLE.member])).toBe(false);
  });

  it('builds ordered ceiling-aware toggles', () => {
    const toggles = buildRoleToggles(t, [MEMBER_ROLE.coach], assignable);
    expect(toggles).toHaveLength(5);
    expect(toggles.find((toggle) => toggle.role === MEMBER_ROLE.coach)?.checked).toBe(true);
    expect(toggles.find((toggle) => toggle.role === MEMBER_ROLE.teamAdmin)?.disabled).toBe(true);
  });
});
