import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildNewsEditorCopy,
  buildNewsSeamNotice,
  buildPublicNewsCopy,
  resolveNewsScreenStatus,
  selectEmptyCopyKeys,
  selectWriteToastKey,
} from './news-copy.helper';

const translate = (key: string): string => key;

const copyInput = {
  error: null,
  isOffline: false,
  onRetry: vi.fn(),
  isSeamLive: false,
};

function query(overrides: Partial<Parameters<typeof resolveNewsScreenStatus>[1]> = {}) {
  return { data: undefined, isLoading: false, error: null, refetch: vi.fn(), ...overrides };
}

describe('selectEmptyCopyKeys', () => {
  it('names the pending copy while the seam is a stub', () => {
    expect(
      selectEmptyCopyKeys(false, {
        live: { title: 'live.t', message: 'live.m' },
        pending: { title: 'pending.t', message: 'pending.m' },
      }),
    ).toEqual({ title: 'pending.t', message: 'pending.m' });
  });

  it('names the ordinary empty copy once the seam is live', () => {
    expect(
      selectEmptyCopyKeys(true, {
        live: { title: 'live.t', message: 'live.m' },
        pending: { title: 'pending.t', message: 'pending.m' },
      }),
    ).toEqual({ title: 'live.t', message: 'live.m' });
  });
});

describe('buildPublicNewsCopy', () => {
  it('says "coming soon" rather than "no stories" while the endpoints are stubbed', () => {
    const copy = buildPublicNewsCopy(translate, copyInput);

    expect(copy.emptyTitle).toBe(I18N_KEYS.news.comingSoonTitle);
    expect(copy.loadingLabel).toBe(I18N_KEYS.news.loading);
    expect(copy.forbiddenTitle).toBe(I18N_KEYS.news.forbiddenTitle);
  });

  it('switches to the ordinary empty copy when the seam reports live', () => {
    expect(buildPublicNewsCopy(translate, { ...copyInput, isSeamLive: true }).emptyTitle).toBe(
      I18N_KEYS.news.emptyTitle,
    );
  });

  it('routes a real failure through the sanitized error table, never a raw message', () => {
    const copy = buildPublicNewsCopy(translate, {
      ...copyInput,
      error: new AppError({
        code: APP_ERROR_CODE.NetworkOffline,
        message: 'ECONNREFUSED 127.0.0.1:9999',
      }),
    });

    expect(copy.errorMessage).not.toContain('ECONNREFUSED');
  });
});

describe('buildNewsEditorCopy', () => {
  it('carries the newsroom namespace, not the public one', () => {
    const copy = buildNewsEditorCopy(translate, copyInput);

    expect(copy.forbiddenTitle).toBe(I18N_KEYS.newsEditor.forbiddenTitle);
    expect(copy.emptyTitle).toBe(I18N_KEYS.newsEditor.comingSoonTitle);
  });

  it('switches to the ordinary empty copy once the seam is live', () => {
    expect(buildNewsEditorCopy(translate, { ...copyInput, isSeamLive: true }).emptyTitle).toBe(
      I18N_KEYS.newsEditor.emptyTitle,
    );
  });
});

describe('buildNewsSeamNotice', () => {
  it('warns the author while writes go nowhere', () => {
    expect(buildNewsSeamNotice(translate, false)).toBe(I18N_KEYS.newsEditor.comingSoonMessage);
  });

  it('says nothing once writes are real', () => {
    expect(buildNewsSeamNotice(translate, true)).toBeNull();
  });
});

describe('selectWriteToastKey', () => {
  it('never claims success for a write that never left the browser', () => {
    expect(selectWriteToastKey(false, 'saved', 'nothing-sent')).toBe('nothing-sent');
  });

  it('reports the real outcome once the seam is live', () => {
    expect(selectWriteToastKey(true, 'saved', 'nothing-sent')).toBe('saved');
  });
});

describe('resolveNewsScreenStatus', () => {
  const scope = { isOffline: false, isLoading: false };

  it('forbids before it loads for a session without the grant', () => {
    expect(resolveNewsScreenStatus(scope, query(), false, false)).toBe('forbidden');
  });

  it('reports empty when the read resolved with nothing', () => {
    expect(resolveNewsScreenStatus(scope, query({ data: { items: [] } }), true, false)).toBe(
      'empty',
    );
  });

  it('reports ready once there is something to show', () => {
    expect(resolveNewsScreenStatus(scope, query({ data: { items: [1] } }), true, true)).toBe(
      'ready',
    );
  });
});
