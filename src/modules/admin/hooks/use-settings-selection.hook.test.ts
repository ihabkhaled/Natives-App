import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSettingsSelection } from './use-settings-selection.hook';

describe('useSettingsSelection', () => {
  it('starts on the first setting key and catalog', () => {
    const { result } = renderHook(() => useSettingsSelection());

    expect(result.current.settingKey).toBe('attendance_statuses');
    expect(result.current.catalog).toBe('division');
  });

  it('follows a valid key change and refuses an unknown one', () => {
    const { result } = renderHook(() => useSettingsSelection());

    act(() => {
      result.current.setSettingKey('badge_tiers');
    });
    expect(result.current.settingKey).toBe('badge_tiers');

    act(() => {
      result.current.setSettingKey('not_a_setting');
    });
    expect(result.current.settingKey).toBe('attendance_statuses');
  });

  it('switches the reference catalog', () => {
    const { result } = renderHook(() => useSettingsSelection());

    act(() => {
      result.current.setCatalog('position');
    });
    expect(result.current.catalog).toBe('position');
  });
});
