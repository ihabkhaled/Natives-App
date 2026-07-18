import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { changeAppLocale } from '../i18n.facade';

import { useAppTranslation } from './use-app-translation.hook';

beforeAll(async () => {
  await initTestI18n();
});

describe('useAppTranslation', () => {
  it('translates a key without params', () => {
    const { result } = renderHook(() => useAppTranslation());

    expect(result.current.t('common.appName')).toBe('Ultimate Natives');
  });

  it('interpolates params into a translation', () => {
    const { result } = renderHook(() => useAppTranslation());

    expect(result.current.t('home.greeting', { name: 'Sam' })).toBe('Hello, Sam');
  });

  it('returns the key when the catalog has no entry', () => {
    const { result } = renderHook(() => useAppTranslation());

    expect(result.current.t('common.missingKey')).toBe('common.missingKey');
  });

  it('exposes the active locale', () => {
    const { result } = renderHook(() => useAppTranslation());

    expect(result.current.locale).toBe('en');
  });

  it('re-renders with the new catalog after a locale change', async () => {
    const { result } = renderHook(() => useAppTranslation());

    await act(async () => {
      await changeAppLocale('ar');
    });

    expect(result.current.locale).toBe('ar');
    expect(result.current.t('common.appName')).toBe('ألتيميت ناتيفز');

    await act(async () => {
      await changeAppLocale('en');
    });
  });

  it('falls back to the raw language when i18next resolves no catalog', async () => {
    const { result } = renderHook(() => useAppTranslation());

    // cimode is i18next's key-passthrough language: it never resolves a catalog.
    await act(async () => {
      await changeAppLocale('cimode');
    });

    expect(result.current.locale).toBe('cimode');

    await act(async () => {
      await changeAppLocale('en');
    });
  });
});
