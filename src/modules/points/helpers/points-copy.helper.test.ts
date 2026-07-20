import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildPointsScreenCopy } from './points-copy.helper';

const t = (key: string): string => key;

describe('buildPointsScreenCopy', () => {
  it('uses the generic message when nothing failed', () => {
    const copy = buildPointsScreenCopy(t, { error: null, isOffline: false, onRetry: vi.fn() });

    expect(copy.errorMessage).toBe('points.errorMessage');
    expect(copy.forbiddenTitle).toBe('points.forbiddenTitle');
    expect(copy.isOffline).toBe(false);
  });

  it('maps a real failure onto its sanitized, translated message', () => {
    const copy = buildPointsScreenCopy(t, {
      error: new AppError({ code: APP_ERROR_CODE.Server, message: 'raw backend copy' }),
      isOffline: true,
      onRetry: vi.fn(),
    });

    expect(copy.errorMessage).not.toBe('raw backend copy');
    expect(copy.errorMessage).toMatch(/^errors\./u);
    expect(copy.isOffline).toBe(true);
  });
});
