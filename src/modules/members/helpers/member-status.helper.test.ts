import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';

import { resolveDirectoryStatus, resolveProfileStatus } from './member-status.helper';

const base = {
  hasData: false,
  hasItems: false,
  hasVisibleItems: false,
  isLoading: false,
  isForbidden: false,
  hasError: false,
  isOffline: false,
};

describe('resolveDirectoryStatus', () => {
  it('resolves each state', () => {
    expect(resolveDirectoryStatus({ ...base, isForbidden: true })).toBe('forbidden');
    expect(resolveDirectoryStatus({ ...base, hasData: true })).toBe('empty');
    expect(resolveDirectoryStatus({ ...base, hasData: true, hasItems: true })).toBe('noMatches');
    expect(
      resolveDirectoryStatus({ ...base, hasData: true, hasItems: true, hasVisibleItems: true }),
    ).toBe('ready');
    expect(resolveDirectoryStatus({ ...base, isOffline: true })).toBe('offline');
    expect(resolveDirectoryStatus({ ...base, isLoading: true })).toBe('loading');
    expect(resolveDirectoryStatus({ ...base, hasError: true })).toBe('error');
    expect(resolveDirectoryStatus(base)).toBe('empty');
  });
});

describe('resolveProfileStatus', () => {
  it('resolves each state', () => {
    const p = { hasData: false, isLoading: false, errorCode: null, isOffline: false };
    expect(resolveProfileStatus({ ...p, errorCode: APP_ERROR_CODE.Forbidden })).toBe('forbidden');
    expect(resolveProfileStatus({ ...p, errorCode: APP_ERROR_CODE.NotFound })).toBe('notFound');
    expect(resolveProfileStatus({ ...p, hasData: true })).toBe('ready');
    expect(resolveProfileStatus({ ...p, isOffline: true })).toBe('offline');
    expect(resolveProfileStatus({ ...p, isLoading: true })).toBe('loading');
    expect(resolveProfileStatus(p)).toBe('loading');
    expect(resolveProfileStatus({ ...p, errorCode: APP_ERROR_CODE.Server })).toBe('error');
  });
});
