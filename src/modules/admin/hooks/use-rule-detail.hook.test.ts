import { act } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { GovernedRule } from '../types/admin.types';
import type { AdminContextView } from '../types/admin-view.types';
import { useRuleDetail } from './use-rule-detail.hook';

const CONTEXT: AdminContextView = {
  teamId: 'team-1',
  membershipId: 'membership-1',
  isOffline: false,
  canReadSettings: true,
  canManageSettings: true,
  canManageRoles: true,
  canManageRules: true,
  canReadAudit: true,
  canManageOutbox: true,
  isLoading: false,
};

const RULE: GovernedRule = {
  ruleId: 'rule-1',
  ruleKey: 'points.v2',
  name: 'Points rule v2',
  description: null,
  version: 2,
  status: 'approved',
  pointEntries: [{ activityCategory: 'practice', points: 8, dailyCap: null, cooldownDays: null }],
  effectiveFrom: null,
  effectiveTo: null,
  recordVersion: 2,
};

afterEach(() => {
  vi.clearAllMocks();
});

beforeAll(async () => {
  await initTestI18n();
});

describe('useRuleDetail', () => {
  it('renders nothing until a rule version is selected', () => {
    const { result } = renderHookWithProviders(() => useRuleDetail(CONTEXT, 'points', null));

    expect(result.current).toBeNull();
  });

  it('blocks the dry run until a member is chosen, and refuses to run without one', () => {
    const { result } = renderHookWithProviders(() => useRuleDetail(CONTEXT, 'points', RULE));

    expect(result.current?.simulation.validationMessage).toBe('Choose a member first.');
    act(() => {
      result.current?.simulation.onRun();
    });

    expect(result.current?.simulation.isRunning).toBe(false);
  });

  it('states that publishing needs a dry run first', () => {
    const { result } = renderHookWithProviders(() => useRuleDetail(CONTEXT, 'points', RULE));

    expect(result.current?.publishBlockedNotice).toContain('Run a simulation before publishing');
    expect(result.current?.actions.find((action) => action.key === 'publish')?.disabled).toBe(true);
  });

  it('offers no lifecycle action at all to a read-only principal', () => {
    const { result } = renderHookWithProviders(() =>
      useRuleDetail({ ...CONTEXT, canManageRules: false }, 'points', RULE),
    );

    expect(result.current?.actions.every((action) => action.disabled)).toBe(true);
  });

  it('renders the rule entries, keeping an unscored category unscored', () => {
    const { result } = renderHookWithProviders(() =>
      useRuleDetail(CONTEXT, 'points', {
        ...RULE,
        pointEntries: [
          { activityCategory: 'gym', points: null, dailyCap: null, cooldownDays: null },
        ],
      }),
    );

    expect(result.current?.entryRows[0]?.value).toBe('Not scored');
  });

  it('accepts a chosen member and unblocks the dry run', () => {
    const { result } = renderHookWithProviders(() => useRuleDetail(CONTEXT, 'points', RULE));

    act(() => {
      result.current?.simulation.onMemberChange('membership-1');
    });

    expect(result.current?.simulation.validationMessage).toBeNull();
  });
});
