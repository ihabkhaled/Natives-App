import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';

import { buildTrainingScreenCopy } from './training-copy.helper';

const t = (key: string): string => key;

describe('buildTrainingScreenCopy', () => {
  const base = {
    error: null,
    isOffline: false,
    onRetry: vi.fn(),
    emptyTitleKey: I18N_KEYS.training.emptyTitle,
    emptyMessageKey: I18N_KEYS.training.emptyMessage,
  };

  it('uses the generic message when nothing failed', () => {
    const copy = buildTrainingScreenCopy(t, base);

    expect(copy.errorMessage).toBe('training.errorMessage');
    expect(copy.isOffline).toBe(false);
    expect(copy.emptyTitle).toBe('training.emptyTitle');
  });

  it('maps a real failure onto its sanitized, translated message', () => {
    const copy = buildTrainingScreenCopy(t, {
      ...base,
      error: new AppError({ code: APP_ERROR_CODE.Forbidden, message: 'raw backend copy' }),
      isOffline: true,
    });

    expect(copy.errorMessage).not.toBe('raw backend copy');
    expect(copy.errorMessage).toMatch(/^errors\./u);
    expect(copy.isOffline).toBe(true);
  });

  it('lets each screen supply its own empty copy', () => {
    const copy = buildTrainingScreenCopy(t, {
      ...base,
      emptyTitleKey: I18N_KEYS.training.notFoundTitle,
      emptyMessageKey: I18N_KEYS.training.notFoundMessage,
    });

    expect(copy.emptyTitle).toBe('training.notFoundTitle');
  });
});
