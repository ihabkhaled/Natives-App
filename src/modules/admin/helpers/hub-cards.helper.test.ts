import { describe, expect, it, vi } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import type { AdminContextView } from '../types/admin-view.types';
import { buildHubCards } from './hub-cards.helper';

const t = (key: string): string => key;

function context(overrides: Partial<AdminContextView> = {}): AdminContextView {
  return {
    teamId: 'team-1',
    membershipId: 'm-1',
    isOffline: false,
    canReadSettings: false,
    canManageSettings: false,
    canManageRoles: false,
    canManageRules: false,
    canReadAudit: false,
    canManageOutbox: false,
    isLoading: false,
    ...overrides,
  };
}

describe('buildHubCards', () => {
  it('shows nothing to a principal holding none of the admin grants', () => {
    expect(buildHubCards(t, context(), vi.fn())).toEqual([]);
  });

  it('shows the settings card only with a settings grant', () => {
    expect(
      buildHubCards(t, context({ canReadSettings: true }), vi.fn()).map((card) => card.key),
    ).toEqual(['settings']);
  });

  it('shows the roles card only with the role-management grant', () => {
    expect(
      buildHubCards(t, context({ canManageRoles: true }), vi.fn()).map((card) => card.key),
    ).toEqual(['roles']);
  });

  it('shows the rules card only with a rule-management grant', () => {
    expect(
      buildHubCards(t, context({ canManageRules: true }), vi.fn()).map((card) => card.key),
    ).toEqual(['rules']);
  });

  it('shows the operations card for either the audit or the outbox grant', () => {
    expect(
      buildHubCards(t, context({ canReadAudit: true }), vi.fn()).map((card) => card.key),
    ).toEqual(['operations']);
    expect(
      buildHubCards(t, context({ canManageOutbox: true }), vi.fn()).map((card) => card.key),
    ).toEqual(['operations']);
  });

  it('shows every card to a fully granted administrator, in a stable order', () => {
    const cards = buildHubCards(
      t,
      context({
        canReadSettings: true,
        canManageRoles: true,
        canManageRules: true,
        canReadAudit: true,
      }),
      vi.fn(),
    );

    expect(cards.map((card) => card.key)).toEqual(['settings', 'roles', 'rules', 'operations']);
  });

  it('opens the destination its guard protects', () => {
    const open = vi.fn();
    buildHubCards(t, context({ canReadSettings: true }), open)[0]?.onOpen();

    expect(open).toHaveBeenCalledWith(APP_PATHS.adminSettings);
  });
});
