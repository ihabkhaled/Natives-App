import { describe, expect, it } from 'vitest';

import { VALID_ATTENDANCE_STATUSES, VALID_BADGE_TIERS } from '@/tests/msw/setting-values.fixture';

import type { EffectiveSetting } from '../types/admin.types';
import type { TypedSettingValue } from '../types/setting-values.types';
import { buildWeightsContext, isScheduleBlocked, resolveDraft } from './setting-form-view.helper';

const t = (key: string): string => key;

const STATUSES_NOW: EffectiveSetting = {
  settingKey: 'attendance_statuses',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  value: VALID_ATTENDANCE_STATUSES as unknown as TypedSettingValue,
  valueState: 'valid',
  issues: [],
};

const QUIET_WEIGHTS = { rows: [], blockedNotice: null, loadingNotice: null } as const;

describe('resolveDraft', () => {
  it('prefers the stored edit over the effective prefill', () => {
    const stored = { tiers: [] };
    const resolved = resolveDraft('badge_tiers', { badge_tiers: stored }, undefined, null);
    expect(resolved).toBe(stored);
  });

  it('prefills from the effective value when nothing was edited yet', () => {
    const effective: EffectiveSetting = {
      settingKey: 'badge_tiers',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      value: VALID_BADGE_TIERS as unknown as TypedSettingValue,
      valueState: 'valid',
      issues: [],
    };
    expect(resolveDraft('badge_tiers', {}, effective, null).tiers).toHaveLength(3);
  });
});

describe('isScheduleBlocked', () => {
  it('blocks on issues, on a validation message, and on blocked weights', () => {
    expect(isScheduleBlocked('badge_tiers', ['issue'], null, QUIET_WEIGHTS)).toBe(true);
    expect(isScheduleBlocked('badge_tiers', [], 'give a reason', QUIET_WEIGHTS)).toBe(true);
    expect(
      isScheduleBlocked('attendance_weights', [], null, {
        ...QUIET_WEIGHTS,
        blockedNotice: 'configure statuses first',
      }),
    ).toBe(true);
    expect(isScheduleBlocked('badge_tiers', [], null, QUIET_WEIGHTS)).toBe(false);
  });
});

describe('buildWeightsContext', () => {
  const base = {
    t,
    locale: 'en',
    settingKey: 'attendance_weights' as const,
    enabled: false,
    isPending: false,
    asOfSettings: undefined,
    statusesNow: STATUSES_NOW,
  };

  it('derives rows from the as-of snapshot once it resolves', () => {
    const context = buildWeightsContext({
      ...base,
      enabled: true,
      asOfSettings: [STATUSES_NOW],
    });
    expect(context.rows.map((row) => row.code)).toContain('injured');
    expect(context.loadingNotice).toBeNull();
  });

  it('reports progress while the as-of snapshot is pending', () => {
    const context = buildWeightsContext({ ...base, enabled: true, isPending: true });
    expect(context.loadingNotice).toBe('settingEditors.weightsLoading');
    expect(context.blockedNotice).toBeNull();
  });

  it('blocks when nothing can derive and stays quiet for other editors', () => {
    const blocked = buildWeightsContext({ ...base, statusesNow: undefined });
    expect(blocked.blockedNotice).toBe('settingEditors.weightsBlocked');

    const otherEditor = buildWeightsContext({
      ...base,
      settingKey: 'badge_tiers',
      statusesNow: undefined,
    });
    expect(otherEditor.blockedNotice).toBeNull();
  });

  it('falls back to the current snapshot when the as-of read has no data yet', () => {
    const context = buildWeightsContext({ ...base, enabled: true, asOfSettings: undefined });
    expect(context.rows.length).toBeGreaterThan(0);
  });
});
