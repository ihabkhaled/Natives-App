import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { humanizeRoleSlug, resolveRoleLabel } from './role-label.helper';

const t = (key: string): string => `t:${key}`;

describe('role-label.helper', () => {
  it('translates a known slug through the client catalog', () => {
    expect(resolveRoleLabel(t, 'coach')).toBe(`t:${I18N_KEYS.members.roleCoach}`);
    expect(resolveRoleLabel(t, 'team_admin')).toBe(`t:${I18N_KEYS.members.roleTeamAdmin}`);
  });

  it('prefers the server display name for an unknown slug', () => {
    expect(resolveRoleLabel(t, 'physio', 'Physiotherapist')).toBe('Physiotherapist');
  });

  it('ignores a blank server display name', () => {
    expect(resolveRoleLabel(t, 'physio', '   ')).toBe('Physio');
  });

  it('humanizes an unknown slug when no display name exists', () => {
    expect(resolveRoleLabel(t, 'physio_lead')).toBe('Physio Lead');
  });

  it('translates a known slug even when a display name is provided', () => {
    expect(resolveRoleLabel(t, 'member', 'Server Member')).toBe(
      `t:${I18N_KEYS.members.roleMember}`,
    );
  });

  it('humanizes multi-part slugs and tolerates stray underscores', () => {
    expect(humanizeRoleSlug('assistant_team_admin')).toBe('Assistant Team Admin');
    expect(humanizeRoleSlug('lead__coach')).toBe('Lead Coach');
  });
});
