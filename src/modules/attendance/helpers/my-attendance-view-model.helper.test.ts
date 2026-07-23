import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { makeParticipationDto, makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import {
  mapAttendanceParticipation,
  mapAttendanceSelfRecord,
} from '../mappers/attendance-self.mapper';
import {
  buildMyAttendanceScreenView,
  type BuildMyAttendanceParams,
  type CheckInSessionContext,
} from './my-attendance-view-model.helper';

const t = (key: string, params?: object): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

const SESSION: CheckInSessionContext = {
  id: 'sess-1',
  title: 'Evening practice',
  startAtIso: '2026-07-26T15:00:00.000Z',
  endAtIso: '2026-07-26T17:00:00.000Z',
};

const IN_WINDOW = '2026-07-26T14:30:00.000Z';

function params(overrides: Partial<BuildMyAttendanceParams> = {}): BuildMyAttendanceParams {
  return {
    t,
    locale: 'en',
    nowIso: IN_WINDOW,
    isOffline: false,
    isLoading: false,
    participation: mapAttendanceParticipation(makeParticipationDto()),
    participationError: null,
    onRetry: vi.fn(),
    nextSession: SESSION,
    selfRecord: mapAttendanceSelfRecord(makeSelfRecordDto()),
    isSelfLoading: false,
    noteValue: '',
    isSubmitting: false,
    onNoteChange: vi.fn(),
    onCheckIn: vi.fn(),
    ...overrides,
  };
}

function ruleMissingError(): AppError {
  return new AppError({
    code: APP_ERROR_CODE.Validation,
    messageKey: I18N_KEYS.errors.practices.attendanceRuleMissing,
  });
}

describe('buildMyAttendanceScreenView status', () => {
  it('is ready with data and stays ready when only the rule is missing', () => {
    expect(buildMyAttendanceScreenView(params()).status).toBe('ready');
    expect(
      buildMyAttendanceScreenView(
        params({ participation: undefined, participationError: ruleMissingError() }),
      ).status,
    ).toBe('ready');
  });

  it('is forbidden on a 403 — the honest no-access answer, never a spinner', () => {
    const view = buildMyAttendanceScreenView(
      params({
        participation: undefined,
        participationError: new AppError({ code: APP_ERROR_CODE.Forbidden }),
      }),
    );

    expect(view.status).toBe('forbidden');
    expect(view.errorMessage).toBe('errors.forbidden');
  });

  it('is loading while fetching, then offline, then error, then loading again', () => {
    expect(
      buildMyAttendanceScreenView(params({ participation: undefined, isLoading: true })).status,
    ).toBe('loading');
    expect(
      buildMyAttendanceScreenView(params({ participation: undefined, isOffline: true })).status,
    ).toBe('offline');
    expect(
      buildMyAttendanceScreenView(
        params({
          participation: undefined,
          participationError: new AppError({ code: APP_ERROR_CODE.Server }),
        }),
      ).status,
    ).toBe('error');
    expect(buildMyAttendanceScreenView(params({ participation: undefined })).status).toBe(
      'loading',
    );
  });
});

describe('participation card', () => {
  it('shows the display rate, the breakdown, and the candidate-rule caveat', () => {
    const view = buildMyAttendanceScreenView(params());

    expect(view.participation?.rateText).toBe('90.9%');
    expect(view.participation?.hasRate).toBe(true);
    expect(view.participation?.breakdown).toHaveLength(7);
    expect(view.participation?.breakdown[0]).toEqual({
      key: 'onTime',
      label: 'attendance.statusPresent',
      valueText: '8',
    });
    expect(view.participation?.candidateNotice).toContain('attendance.participationRuleCandidate');
    expect(view.participation?.isNotConfigured).toBe(false);
  });

  it('says "not enough data" for a null rate and drops the candidate caveat once approved', () => {
    const view = buildMyAttendanceScreenView(
      params({
        participation: mapAttendanceParticipation(
          makeParticipationDto({
            attendanceRate: null,
            attendanceRatePercent: null,
            ruleStatus: 'approved',
          }),
        ),
      }),
    );

    expect(view.participation?.rateText).toBe('attendance.participationNotEnoughData');
    expect(view.participation?.hasRate).toBe(false);
    expect(view.participation?.candidateNotice).toBeNull();
  });

  it('renders the calm not-configured body when no rule is approved yet', () => {
    const view = buildMyAttendanceScreenView(
      params({ participation: undefined, participationError: ruleMissingError() }),
    );

    expect(view.participation?.isNotConfigured).toBe(true);
    expect(view.participation?.breakdown).toEqual([]);
  });

  it('has no card while the summary is still loading', () => {
    const view = buildMyAttendanceScreenView(params({ participation: undefined, isLoading: true }));

    expect(view.participation).toBeNull();
  });
});

describe('check-in card', () => {
  it('arms the button inside the provisional window with the honest caveat', () => {
    const view = buildMyAttendanceScreenView(params());

    expect(view.checkIn.sessionLabel).toContain('Evening practice');
    expect(view.checkIn.canCheckIn).toBe(true);
    expect(view.checkIn.provisionalNotice).toBe('attendance.checkInProvisional');
    expect(view.checkIn.offlineNotice).toBeNull();
    expect(view.checkIn.statusChip).toBeNull();
  });

  it('labels an untitled session with its start instant alone', () => {
    const view = buildMyAttendanceScreenView(params({ nextSession: { ...SESSION, title: null } }));

    expect(view.checkIn.sessionLabel).not.toContain('·');
  });

  it('disables the button offline with the no-queue policy notice', () => {
    const view = buildMyAttendanceScreenView(params({ isOffline: true }));

    expect(view.checkIn.canCheckIn).toBe(false);
    expect(view.checkIn.offlineNotice).toBe('attendance.checkInOfflineNotice');
  });

  it('never double-submits while a check-in is in flight', () => {
    expect(buildMyAttendanceScreenView(params({ isSubmitting: true })).checkIn.canCheckIn).toBe(
      false,
    );
  });

  it('says when check-in opens before the window and closed after it', () => {
    const early = buildMyAttendanceScreenView(params({ nowIso: '2026-07-26T10:00:00.000Z' }));
    expect(early.checkIn.stateMessage).toContain('attendance.checkInOpensAt');
    expect(early.checkIn.canCheckIn).toBe(false);

    const late = buildMyAttendanceScreenView(params({ nowIso: '2026-07-26T18:00:00.000Z' }));
    expect(late.checkIn.stateMessage).toBe('attendance.checkInClosed');
  });

  it('shows the recorded chip and who recorded it', () => {
    const self = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({ status: 'present_on_time', source: 'self' }),
        ),
      }),
    );
    expect(self.checkIn.statusChip?.label).toBe('attendance.statusPresent');
    expect(self.checkIn.stateMessage).toBe('attendance.checkInRecordedSelf');
    expect(self.checkIn.provisionalNotice).toBeNull();

    const coach = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({ status: 'excused', source: 'coach' }),
        ),
      }),
    );
    expect(coach.checkIn.stateMessage).toBe('attendance.checkInRecordedStaff');
  });

  it('renders the server-ruled locked and not-open states once B1 ships them', () => {
    const locked = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({ selfCheckIn: { state: 'locked', opensAt: null, closesAt: null } }),
        ),
      }),
    );
    expect(locked.checkIn.stateMessage).toBe('attendance.checkInLocked');
    expect(locked.checkIn.canCheckIn).toBe(false);

    const notOpen = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({ selfCheckIn: { state: 'not_open', opensAt: null, closesAt: null } }),
        ),
      }),
    );
    expect(notOpen.checkIn.stateMessage).toBe('attendance.checkInNotOpen');
  });

  it('offers no check-in without an upcoming session', () => {
    const view = buildMyAttendanceScreenView(params({ nextSession: null }));

    expect(view.checkIn.sessionLabel).toBeNull();
    expect(view.checkIn.canCheckIn).toBe(false);
    expect(view.checkIn.isLoading).toBe(false);
  });

  it('keeps a skeleton while the own record is still loading', () => {
    const view = buildMyAttendanceScreenView(
      params({ selfRecord: undefined, isSelfLoading: true }),
    );

    expect(view.checkIn.isLoading).toBe(true);
  });

  it('opens exactly at the server-ruled open state without the provisional caveat', () => {
    const view = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({
            selfCheckIn: {
              state: 'open',
              opensAt: '2026-07-26T14:00:00.000Z',
              closesAt: '2026-07-26T17:00:00.000Z',
            },
          }),
        ),
      }),
    );

    expect(view.checkIn.canCheckIn).toBe(true);
    expect(view.checkIn.provisionalNotice).toBeNull();
  });
});
