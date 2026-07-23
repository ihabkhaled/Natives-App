import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import type { AdminContextView } from '../types/admin-view.types';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from './admin-copy.helper';

const t = (key: string): string => key;

const CONTEXT: AdminContextView = {
  teamId: 'team-1',
  membershipId: 'm-1',
  isOffline: false,
  canReadSettings: true,
  canManageSettings: true,
  canManageRoles: true,
  canManageRules: true,
  canReadAudit: true,
  canManageOutbox: true,
  canManagePlatform: true,
  isLoading: false,
};

const READY = { data: {}, isLoading: false, error: null, refetch: vi.fn() };

describe('buildAdminScreenCopy', () => {
  it('binds one admin namespace to the shared state copy', () => {
    const copy = buildAdminScreenCopy(t, {
      keys: I18N_KEYS.adminSettings,
      error: null,
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: I18N_KEYS.adminSettings.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminSettings.emptyMessage,
    });

    expect(copy.loadingLabel).toBe('adminSettings.loadingLabel');
    expect(copy.forbiddenTitle).toBe('adminSettings.forbiddenTitle');
    expect(copy.emptyTitle).toBe('adminSettings.emptyTitle');
  });
});

describe('resolveAdminScreenStatus', () => {
  it('is ready once the screen has something to show', () => {
    expect(resolveAdminScreenStatus(CONTEXT, READY, true, true)).toBe('ready');
  });

  it('is empty once the read resolved with nothing', () => {
    expect(resolveAdminScreenStatus(CONTEXT, READY, true, false)).toBe('empty');
  });

  it('is forbidden ahead of loading, so a spinner never resolves into denied data', () => {
    expect(resolveAdminScreenStatus(CONTEXT, READY, false, true)).toBe('forbidden');
  });

  it('is loading while the team scope is still resolving', () => {
    expect(resolveAdminScreenStatus({ ...CONTEXT, isLoading: true }, READY, true, true)).toBe(
      'loading',
    );
  });
});
