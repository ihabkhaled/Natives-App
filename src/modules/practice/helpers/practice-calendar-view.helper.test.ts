import { describe, expect, it, vi } from 'vitest';

import type { TranslateParams } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  buildPracticeSessionListPage,
  buildPracticeSessionSummary,
} from '../../../../tests/factories/practice.factory';
import { PRACTICE_SCOPE } from '../constants/practice.constants';
import {
  buildPracticeCalendarView,
  type BuildPracticeCalendarViewParams,
} from './practice-calendar-view.helper';

const t = (key: string, params?: TranslateParams): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

function params(
  overrides: Partial<BuildPracticeCalendarViewParams> = {},
): BuildPracticeCalendarViewParams {
  return {
    t,
    locale: 'en',
    page: buildPracticeSessionListPage(),
    isLoading: false,
    isFetching: false,
    error: null,
    isOffline: false,
    scope: PRACTICE_SCOPE.upcoming,
    type: null,
    rsvp: null,
    pageSize: 20,
    onScopeChange: vi.fn(),
    onTypeChange: vi.fn(),
    onRsvpChange: vi.fn(),
    onRetry: vi.fn(),
    onLoadMore: vi.fn(),
    onSelectSession: vi.fn(),
    ...overrides,
  };
}

describe('buildPracticeCalendarView', () => {
  it('is ready with grouped sections and a blank error message', () => {
    const view = buildPracticeCalendarView(params());

    expect(view.status).toBe('ready');
    expect(view.sections).toHaveLength(1);
    expect(view.errorMessage).toBe('');
    expect(view.filter.scopeOptions.length).toBeGreaterThan(0);
  });

  it('maps an error code to a message', () => {
    const view = buildPracticeCalendarView(
      params({ page: undefined, error: new AppError({ code: APP_ERROR_CODE.Server }) }),
    );

    expect(view.status).toBe('error');
    expect(view.errorMessage).toBe('errors.server');
  });

  it('resolves a forbidden error to the forbidden state', () => {
    const view = buildPracticeCalendarView(
      params({ page: undefined, error: new AppError({ code: APP_ERROR_CODE.Forbidden }) }),
    );

    expect(view.status).toBe('forbidden');
  });

  it('offers load-more while below the max page size', () => {
    const view = buildPracticeCalendarView(
      params({
        page: buildPracticeSessionListPage({
          items: [buildPracticeSessionSummary()],
          hasMore: true,
        }),
        pageSize: 20,
      }),
    );

    expect(view.hasMore).toBe(true);
    expect(view.boundedNotice).toBeNull();
  });

  it('shows the bounded notice at the max page size', () => {
    const view = buildPracticeCalendarView(
      params({
        page: buildPracticeSessionListPage({
          items: [buildPracticeSessionSummary()],
          hasMore: true,
        }),
        pageSize: 100,
      }),
    );

    expect(view.hasMore).toBe(false);
    expect(view.boundedNotice?.startsWith('practice.boundedNotice')).toBe(true);
  });

  it('flags a background fetch of the next window', () => {
    const view = buildPracticeCalendarView(params({ isFetching: true, isLoading: false }));

    expect(view.isFetchingMore).toBe(true);
  });

  it('returns no sections when there is no page yet', () => {
    const view = buildPracticeCalendarView(params({ page: undefined, isLoading: true }));

    expect(view.sections).toEqual([]);
    expect(view.status).toBe('loading');
  });
});
