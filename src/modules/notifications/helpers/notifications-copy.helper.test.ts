import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  buildNotificationsScreenCopy,
  resolveNotificationsScreenStatus,
} from './notifications-copy.helper';

const t = (key: string): string => key;

const CONTEXT = {
  teamName: 'Cairo Natives',
  isOffline: false,
  canReadDeliveryFailures: false,
  isLoading: false,
};

function query(overrides: Partial<ReturnType<typeof baseQuery>> = {}) {
  return { ...baseQuery(), ...overrides };
}

function baseQuery() {
  return { data: undefined as unknown, isLoading: false, error: null, refetch: vi.fn() };
}

describe('buildNotificationsScreenCopy', () => {
  it('binds the notifications namespace to the shared state copy', () => {
    const copy = buildNotificationsScreenCopy(t, {
      error: null,
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: 'notifications.emptyTitle',
      emptyMessageKey: 'notifications.emptyMessage',
    });

    expect(copy.loadingLabel).toBe('notifications.loadingLabel');
    expect(copy.forbiddenTitle).toBe('notifications.forbiddenTitle');
    expect(copy.emptyTitle).toBe('notifications.emptyTitle');
  });

  it('routes a real failure through the sanitized error table', () => {
    const copy = buildNotificationsScreenCopy(t, {
      error: new AppError({
        code: APP_ERROR_CODE.NetworkOffline,
        message: 'raw backend detail',
      }),
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: 'notifications.emptyTitle',
      emptyMessageKey: 'notifications.emptyMessage',
    });

    expect(copy.errorMessage).toBe('errors.network');
  });
});

describe('resolveNotificationsScreenStatus', () => {
  it('is ready once the inbox has entries', () => {
    expect(
      resolveNotificationsScreenStatus(CONTEXT, query({ data: {} }), true, true),
    ).toBe('ready');
  });

  it('is empty once the inbox resolved with nothing in it', () => {
    expect(resolveNotificationsScreenStatus(CONTEXT, query({ data: {} }), true, false)).toBe(
      'empty',
    );
  });

  it('is forbidden ahead of everything else', () => {
    expect(
      resolveNotificationsScreenStatus(CONTEXT, query({ data: {} }), false, true),
    ).toBe('forbidden');
  });
});
