import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { VALID_ATTENDANCE_STATUSES } from '@/tests/msw/setting-values.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { EffectiveSetting } from '../types/admin.types';
import type { TypedSettingValue } from '../types/setting-values.types';
import { useEffectiveInstant } from './use-effective-instant.hook';
import { useWeightRows } from './use-weight-rows.hook';

const STATUSES_NOW: EffectiveSetting = {
  settingKey: 'attendance_statuses',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  value: VALID_ATTENDANCE_STATUSES as unknown as TypedSettingValue,
  valueState: 'valid',
  issues: [],
};

beforeAll(async () => {
  await initTestI18n();
});

describe('useWeightRows', () => {
  it('stays quiet for every editor except the weights', () => {
    const { result } = renderHookWithProviders(() =>
      useWeightRows('team-1', 'badge_tiers', '', STATUSES_NOW),
    );

    expect(result.current.rows).toHaveLength(4);
    expect(result.current.blockedNotice).toBeNull();
    expect(result.current.loadingNotice).toBeNull();
  });

  it('derives rows from the current snapshot before an instant is chosen', () => {
    const { result } = renderHookWithProviders(() =>
      useWeightRows('team-1', 'attendance_weights', '', STATUSES_NOW),
    );

    expect(result.current.rows.map((row) => row.code)).toContain('injured');
    expect(result.current.blockedNotice).toBeNull();
  });

  it('blocks the weights editor when no statuses are configured', () => {
    const { result } = renderHookWithProviders(() =>
      useWeightRows('team-1', 'attendance_weights', '', undefined),
    );

    expect(result.current.rows).toEqual([]);
    expect(result.current.blockedNotice).toContain('Configure attendance statuses first');
  });

  it('reports progress while the as-of snapshot resolves', () => {
    const { result } = renderHookWithProviders(() =>
      useWeightRows('team-1', 'attendance_weights', '2026-09-01T00:00:00.000Z', STATUSES_NOW),
    );

    expect(result.current.loadingNotice).not.toBeNull();
    expect(result.current.blockedNotice).toBeNull();
  });
});

describe('useEffectiveInstant', () => {
  it('mirrors the wall time as strict UTC and owns the picker state', () => {
    const { result } = renderHookWithProviders(() => useEffectiveInstant());

    expect(result.current.utcIso).toBe('');
    act(() => {
      result.current.onChange('2026-08-01T18:00');
    });
    expect(result.current.utcIso).toBe('2026-08-01T15:00:00.000Z');

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.onDismiss();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
