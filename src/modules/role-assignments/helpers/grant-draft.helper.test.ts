import { describe, expect, it } from 'vitest';

import { MOCK_ASSIGNABLE_ROLES } from '@/tests/msw/role-assignments.fixture';

import { buildRoleOptions, resolveGrantIntent } from './grant-draft.helper';

const t = (key: string): string => `t:${key}`;

describe('buildRoleOptions', () => {
  it('offers the server catalog verbatim, in the order it arrived', () => {
    // This list IS the actor's privilege ceiling; nothing is added or filtered.
    expect(buildRoleOptions(t, MOCK_ASSIGNABLE_ROLES).map((option) => option.value)).toEqual([
      'member',
      'coach',
      'scorekeeper',
    ]);
  });

  it('translates a slug the client ships copy for', () => {
    const [option] = buildRoleOptions(t, [
      { slug: 'coach', displayName: 'Coach', description: '' },
    ]);

    expect(option?.label).toBe('t:members.roleCoach');
  });

  it('falls back to the server’s own display name for an unknown slug', () => {
    const [option] = buildRoleOptions(t, [
      { slug: 'physio_lead', displayName: 'Physiotherapy Lead', description: '' },
    ]);

    // A role added server-side stays legible with no client release.
    expect(option?.label).toBe('Physiotherapy Lead');
  });

  it('offers nothing when the actor may pass nothing on', () => {
    expect(buildRoleOptions(t, [])).toEqual([]);
  });
});

describe('resolveGrantIntent', () => {
  it('upper-cases the catalog slug into the roleKey the wire expects', () => {
    // assignable-roles speaks slugs; POST /rbac/assignments speaks roleKeys.
    expect(
      resolveGrantIntent({ userId: 'user-1', roleSlug: 'coach' }, MOCK_ASSIGNABLE_ROLES),
    ).toEqual({ userId: 'user-1', roleKey: 'COACH' });
  });

  it('refuses a role the server never offered', () => {
    // The one guarantee this screen makes: it cannot ask for an escalation.
    expect(
      resolveGrantIntent({ userId: 'user-1', roleSlug: 'super_admin' }, MOCK_ASSIGNABLE_ROLES),
    ).toBeNull();
  });

  it('refuses once the catalog has shrunk beneath an open form', () => {
    expect(resolveGrantIntent({ userId: 'user-1', roleSlug: 'coach' }, [])).toBeNull();
  });

  it('refuses a draft with no role chosen yet', () => {
    expect(
      resolveGrantIntent({ userId: 'user-1', roleSlug: '' }, MOCK_ASSIGNABLE_ROLES),
    ).toBeNull();
  });

  it('refuses a draft with no target user', () => {
    expect(
      resolveGrantIntent({ userId: '   ', roleSlug: 'coach' }, MOCK_ASSIGNABLE_ROLES),
    ).toBeNull();
  });

  it('trims the target user id, which would otherwise address a different path', () => {
    expect(
      resolveGrantIntent({ userId: '  user-1  ', roleSlug: 'coach' }, MOCK_ASSIGNABLE_ROLES)
        ?.userId,
    ).toBe('user-1');
  });

  it('folds an unknown slug the same way, without a client-side allow list', () => {
    expect(
      resolveGrantIntent({ userId: 'user-1', roleSlug: 'physio_lead' }, [
        { slug: 'physio_lead', displayName: 'Physio Lead', description: '' },
      ])?.roleKey,
    ).toBe('PHYSIO_LEAD');
  });
});
