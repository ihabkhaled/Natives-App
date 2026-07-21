import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { MATCHES_COPY_NAMESPACE } from '../constants/matches-labels.constants';
import { buildMatchesScreenCopy, resolveMatchesScreenStatus } from './matches-copy.helper';
import type { MatchesContextView } from '../types/matches-view.types';

const t = (key: string): string => key;

const CONTEXT: MatchesContextView = {
  teamId: 'team-natives',
  userId: 'user-1',
  isOffline: false,
  canReadMatches: true,
  canScoreMatch: true,
  canFinalizeMatch: true,
  canReadStatistics: true,
  canReadAnalysis: true,
  isLoading: false,
};

const QUERY = { data: { items: [] }, isLoading: false, error: null, refetch: vi.fn() };

describe('buildMatchesScreenCopy', () => {
  it('resolves the five designed states from one namespace', () => {
    const copy = buildMatchesScreenCopy(t, {
      namespace: MATCHES_COPY_NAMESPACE,
      error: null,
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: I18N_KEYS.matches.emptyTitle,
      emptyMessageKey: I18N_KEYS.matches.emptyMessage,
    });

    expect(copy.loadingLabel).toBe(I18N_KEYS.matches.loadingLabel);
    expect(copy.errorMessage).toBe(I18N_KEYS.matches.errorMessage);
    expect(copy.emptyTitle).toBe(I18N_KEYS.matches.emptyTitle);
  });

  it('maps a real failure through the sanitized error table', () => {
    const copy = buildMatchesScreenCopy(t, {
      namespace: MATCHES_COPY_NAMESPACE,
      error: new AppError({ code: APP_ERROR_CODE.Conflict }),
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: I18N_KEYS.matches.emptyTitle,
      emptyMessageKey: I18N_KEYS.matches.emptyMessage,
    });

    expect(copy.errorMessage).toBe(I18N_KEYS.errors.conflict);
  });
});

describe('resolveMatchesScreenStatus', () => {
  it('shows forbidden before anything else', () => {
    expect(resolveMatchesScreenStatus(CONTEXT, QUERY, false, true)).toBe('forbidden');
  });

  it('shows the empty state when the read produced nothing', () => {
    expect(resolveMatchesScreenStatus(CONTEXT, QUERY, true, false)).toBe('empty');
  });

  it('shows ready once there is something to render', () => {
    expect(resolveMatchesScreenStatus(CONTEXT, QUERY, true, true)).toBe('ready');
  });

  it('shows loading while the scope resolves', () => {
    expect(resolveMatchesScreenStatus({ ...CONTEXT, isLoading: true }, QUERY, true, true)).toBe(
      'loading',
    );
  });
});
