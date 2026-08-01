import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { changeAppLocale, getActiveLocale } from '@/packages/i18n';
import { APP_LOCALE } from '@/shared/enums';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useSettingsStore } from '../store/settings.store';
import { useLocaleToggle } from './use-locale-toggle.hook';

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(async () => {
  localStorage.clear();
  useSettingsStore.setState({ locale: APP_LOCALE.English });
  await changeAppLocale(APP_LOCALE.English);
});

describe('useLocaleToggle', () => {
  it('reports the stored locale and whether it is Arabic', () => {
    const { result } = renderHook(() => useLocaleToggle());

    expect(result.current.locale).toBe(APP_LOCALE.English);
    expect(result.current.isArabic).toBe(false);
  });

  it('flips English to Arabic, persisting and applying the change', async () => {
    const { result } = renderHook(() => useLocaleToggle());

    act(() => {
      result.current.toggle();
    });

    expect(useSettingsStore.getState().locale).toBe(APP_LOCALE.Arabic);
    await waitFor(() => {
      expect(getActiveLocale()).toBe(APP_LOCALE.Arabic);
    });
  });

  it('flips Arabic back to English', async () => {
    act(() => {
      useSettingsStore.getState().setLocale(APP_LOCALE.Arabic);
    });
    const { result } = renderHook(() => useLocaleToggle());

    act(() => {
      result.current.toggle();
    });

    expect(useSettingsStore.getState().locale).toBe(APP_LOCALE.English);
    await waitFor(() => {
      expect(getActiveLocale()).toBe(APP_LOCALE.English);
    });
  });
});
