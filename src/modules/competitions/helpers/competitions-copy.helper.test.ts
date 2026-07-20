import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors/app.errors';

import {
  COMPETITIONS_COPY_NAMESPACE,
  SQUADS_COPY_NAMESPACE,
} from '../constants/competitions-labels.constants';
import type { CompetitionsContextView } from '../types/competitions-view.types';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from './competitions-copy.helper';

const t = (key: string): string => key;

function context(overrides: Partial<CompetitionsContextView> = {}): CompetitionsContextView {
  return {
    teamId: 'team-1',
    membershipId: 'm-1',
    isOffline: false,
    canReadCompetitions: true,
    canManageCompetitions: false,
    canReadSquads: true,
    canManageSquads: false,
    canOverrideEligibility: false,
    canReadRoster: true,
    canManageRoster: false,
    canLockRoster: false,
    isLoading: false,
    ...overrides,
  };
}

function query(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    data: { items: [] },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as never;
}

describe('buildCompetitionsScreenCopy', () => {
  it('uses the namespace error copy when nothing failed', () => {
    const copy = buildCompetitionsScreenCopy(t, {
      namespace: COMPETITIONS_COPY_NAMESPACE,
      error: null,
      isOffline: false,
      onRetry: vi.fn(),
      emptyTitleKey: 'competitions.emptyTitle',
      emptyMessageKey: 'competitions.emptyMessage',
    });

    expect(copy.errorMessage).toBe('competitions.errorMessage');
    expect(copy.forbiddenTitle).toBe('competitions.forbiddenTitle');
    expect(copy.isOffline).toBe(false);
  });

  it('maps a real failure to its sanitized error key', () => {
    const copy = buildCompetitionsScreenCopy(t, {
      namespace: SQUADS_COPY_NAMESPACE,
      error: new AppError({ code: 'FORBIDDEN', message: 'raw backend text' }),
      isOffline: true,
      onRetry: vi.fn(),
      emptyTitleKey: 'squads.emptyTitle',
      emptyMessageKey: 'squads.emptyMessage',
    });

    expect(copy.errorMessage).not.toContain('raw backend text');
    expect(copy.loadingLabel).toBe('squads.loadingLabel');
    expect(copy.isOffline).toBe(true);
  });
});

describe('resolveCompetitionsScreenStatus', () => {
  it('shows forbidden ahead of everything else', () => {
    expect(resolveCompetitionsScreenStatus(context(), query(), false, true)).toBe('forbidden');
  });

  it('waits while the scope is still resolving', () => {
    expect(
      resolveCompetitionsScreenStatus(context({ isLoading: true }), query(), false, false),
    ).toBe('loading');
  });

  it('reports ready with items and empty without them', () => {
    expect(resolveCompetitionsScreenStatus(context(), query(), true, true)).toBe('ready');
    expect(resolveCompetitionsScreenStatus(context(), query(), true, false)).toBe('empty');
  });

  it('reports offline when there is no cached data to fall back on', () => {
    expect(
      resolveCompetitionsScreenStatus(
        context({ isOffline: true }),
        query({ data: undefined }),
        true,
        false,
      ),
    ).toBe('offline');
  });
});
