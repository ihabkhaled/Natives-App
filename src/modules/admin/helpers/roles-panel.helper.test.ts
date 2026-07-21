import { describe, expect, it, vi } from 'vitest';

import { MEMBER_ROLE } from '@/modules/members';

import { buildRolesPanel } from './roles-panel.helper';

const t = (key: string): string => key;

const BASE = {
  membershipId: 'm-1',
  hasRoles: true,
  members: [],
  assignable: [MEMBER_ROLE.member],
  selected: [MEMBER_ROLE.member],
  reason: 'Promoted after the AGM',
  isReasonValid: true,
  onToggle: vi.fn(),
};

describe('buildRolesPanel', () => {
  it('treats a chosen member with resolved roles as a selection', () => {
    expect(buildRolesPanel(t, BASE).hasSelection).toBe(true);
  });

  it('is not a selection before a member is chosen', () => {
    expect(buildRolesPanel(t, { ...BASE, membershipId: '' }).hasSelection).toBe(false);
  });

  it('is not a selection while the roles are still resolving', () => {
    expect(buildRolesPanel(t, { ...BASE, hasRoles: false }).hasSelection).toBe(false);
  });

  it('always states the privilege ceiling', () => {
    expect(buildRolesPanel(t, BASE).ceilingNotice).toBe('adminRoles.ceilingNotice');
  });

  it('says plainly when there is no role the actor can pass on', () => {
    expect(buildRolesPanel(t, { ...BASE, assignable: [] }).noAssignableLabel).toBe(
      'adminRoles.noAssignable',
    );
  });

  it('does not claim an empty ceiling when there are assignable roles', () => {
    expect(buildRolesPanel(t, BASE).noAssignableLabel).toBeNull();
  });

  it('surfaces the missing-reason validation message', () => {
    expect(buildRolesPanel(t, { ...BASE, isReasonValid: false }).validationMessage).toBe(
      'adminRoles.reasonRequired',
    );
    expect(buildRolesPanel(t, BASE).validationMessage).toBeNull();
  });
});
