import { describe, expect, it, vi } from 'vitest';

import type { TranslateParams } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import {
  buildPracticeSessionScreenView,
  type BuildPracticeSessionScreenParams,
} from './practice-session-screen.helper';

const t = (key: string, params?: TranslateParams): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

function params(
  overrides: Partial<BuildPracticeSessionScreenParams> = {},
): BuildPracticeSessionScreenParams {
  return {
    t,
    locale: 'en',
    detail: buildPracticeSessionDetail(),
    isLoading: false,
    error: null,
    isOffline: false,
    now: '2026-07-25T00:00:00.000Z',
    canRsvpSelf: true,
    canRecordAttendance: false,
    selectedReason: null,
    isSubmitting: false,
    isConflict: false,
    onRetry: vi.fn(),
    onSelectReason: vi.fn(),
    onSubmitRsvp: vi.fn(),
    onOpenMap: vi.fn(),
    onOpenAttendance: vi.fn(),
    ...overrides,
  };
}

describe('buildPracticeSessionScreenView', () => {
  it('is ready with the detail and the session title', () => {
    const view = buildPracticeSessionScreenView(params());

    expect(view.status).toBe('ready');
    expect(view.title).toBe('Evening practice');
    expect(view.detail).not.toBeNull();
    expect(view.conflictNote).toBeNull();
  });

  it('falls back to a generic title while loading', () => {
    const view = buildPracticeSessionScreenView(params({ detail: undefined, isLoading: true }));

    expect(view.status).toBe('loading');
    expect(view.detail).toBeNull();
    expect(view.title).toBe('practice.calendarTitle');
  });

  it('maps a forbidden error to the forbidden state', () => {
    const view = buildPracticeSessionScreenView(
      params({ detail: undefined, error: new AppError({ code: APP_ERROR_CODE.Forbidden }) }),
    );

    expect(view.status).toBe('forbidden');
  });

  it('maps a not-found error to the error state with a message', () => {
    const view = buildPracticeSessionScreenView(
      params({ detail: undefined, error: new AppError({ code: APP_ERROR_CODE.NotFound }) }),
    );

    expect(view.status).toBe('error');
    expect(view.errorMessage).toBe('errors.notFound');
  });

  it('surfaces the conflict note on a version conflict', () => {
    const view = buildPracticeSessionScreenView(params({ isConflict: true }));

    expect(view.conflictNote).toBe('practice.rsvpConflict');
  });

  it('hides the attendance CTA without the record grant', () => {
    const view = buildPracticeSessionScreenView(params());

    expect(view.attendanceCta).toBeNull();
  });

  it('offers "record attendance" to permitted staff before the session ends', () => {
    const onOpenAttendance = vi.fn();
    const view = buildPracticeSessionScreenView(
      params({ canRecordAttendance: true, onOpenAttendance }),
    );

    expect(view.attendanceCta?.heading).toBe('attendance.title');
    expect(view.attendanceCta?.label).toBe('attendance.sessionAttendanceCta');
    view.attendanceCta?.onOpen();
    expect(onOpenAttendance).toHaveBeenCalledTimes(1);
  });

  it('switches the CTA to "view attendance" after the session end instant', () => {
    const view = buildPracticeSessionScreenView(
      params({ canRecordAttendance: true, now: '2026-07-30T00:00:00.000Z' }),
    );

    expect(view.attendanceCta?.label).toBe('attendance.sessionAttendanceCtaFinalized');
  });

  it('withholds the CTA while the detail has not resolved', () => {
    const view = buildPracticeSessionScreenView(
      params({ canRecordAttendance: true, detail: undefined, isLoading: true }),
    );

    expect(view.attendanceCta).toBeNull();
  });
});
