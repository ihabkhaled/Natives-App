import { describe, expect, it, vi } from 'vitest';

import { MEMBER_ROLE } from '@/modules/members';

import { buildMemberOptions, buildRoleToggles, describeCurrentRoles } from './roles-view.helper';

const t = (key: string): string => key;

describe('buildMemberOptions', () => {
  it('offers one option per directory row', () => {
    expect(
      buildMemberOptions([
        {
          membershipId: 'm-1',
          status: 'active',
          displayName: 'Omar Hassan',
          nickname: null,
          jerseyNumber: null,
          positions: [],
          hasAvatar: false,
        },
      ]),
    ).toEqual([{ value: 'm-1', label: 'Omar Hassan' }]);
  });

  it('produces nothing for an empty directory', () => {
    expect(buildMemberOptions([])).toEqual([]);
  });
});

describe('buildRoleToggles', () => {
  it('offers only the roles inside the acting principal ceiling', () => {
    const toggles = buildRoleToggles(
      t,
      [MEMBER_ROLE.member],
      [MEMBER_ROLE.member, MEMBER_ROLE.coach],
      vi.fn(),
    );

    expect(toggles.map((toggle) => toggle.key)).toEqual([MEMBER_ROLE.member, MEMBER_ROLE.coach]);
    expect(toggles.map((toggle) => toggle.selected)).toEqual([true, false]);
  });

  it('never offers a role above the ceiling, even when the member holds it', () => {
    const toggles = buildRoleToggles(t, [MEMBER_ROLE.teamAdmin], [MEMBER_ROLE.member], vi.fn());

    expect(toggles.map((toggle) => toggle.key)).toEqual([MEMBER_ROLE.member]);
  });

  it('emits the toggled role', () => {
    const toggle = vi.fn();
    buildRoleToggles(t, [], [MEMBER_ROLE.coach], toggle)[0]?.onToggle();

    expect(toggle).toHaveBeenCalledWith(MEMBER_ROLE.coach);
  });
});

describe('describeCurrentRoles', () => {
  it('joins the held roles into one readable line', () => {
    expect(describeCurrentRoles(t, [MEMBER_ROLE.member, MEMBER_ROLE.coach])).toBe(
      'members.roleMember · members.roleCoach',
    );
  });

  it('states "none" instead of rendering an empty line', () => {
    expect(describeCurrentRoles(t, [])).toBe('adminRoles.currentNone');
  });
});
