import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import {
  makeParticipationDto,
  makeSelfHistoryDto,
  makeSelfHistoryEntryDto,
  makeSelfRecordDto,
} from '@/tests/msw/attendance-wire.fixture';

import {
  mapAttendanceParticipation,
  mapAttendanceSelfHistory,
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
};

function params(overrides: Partial<BuildMyAttendanceParams> = {}): BuildMyAttendanceParams {
  return {
    t,
    locale: 'en',
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
    history: mapAttendanceSelfHistory(makeSelfHistoryDto()),
    isHistoryLoading: false,
    canGrowHistory: true,
    onLoadMoreHistory: vi.fn(),
    ...overrides,
  };
}

function recordInState(
  state: 'not_open' | 'open' | 'closed' | 'locked' | 'recorded',
  recordOverrides: Parameters<typeof makeSelfRecordDto>[0] = {},
) {
  return mapAttendanceSelfRecord(
    makeSelfRecordDto({
      selfCheckIn: {
        state,
        opensAt: '2026-07-26T14:00:00.000Z',
        closesAt: '2026-07-26T17:00:00.000Z',
      },
      ...recordOverrides,
    }),
  );
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

describe('check-in card server-state mapping', () => {
  it('arms the button only for the server-ruled open state', () => {
    const view = buildMyAttendanceScreenView(params({ selfRecord: recordInState('open') }));

    expect(view.checkIn.sessionLabel).toContain('Evening practice');
    expect(view.checkIn.canCheckIn).toBe(true);
    expect(view.checkIn.stateMessage).toBeNull();
    expect(view.checkIn.statusChip).toBeNull();
  });

  it('labels an untitled session with its start instant alone', () => {
    const view = buildMyAttendanceScreenView(params({ nextSession: { ...SESSION, title: null } }));

    expect(view.checkIn.sessionLabel).not.toContain('·');
  });

  it('disables the button offline with the no-queue policy notice', () => {
    const view = buildMyAttendanceScreenView(
      params({ selfRecord: recordInState('open'), isOffline: true }),
    );

    expect(view.checkIn.canCheckIn).toBe(false);
    expect(view.checkIn.offlineNotice).toBe('attendance.checkInOfflineNotice');
  });

  it('never double-submits while a check-in is in flight', () => {
    expect(buildMyAttendanceScreenView(params({ isSubmitting: true })).checkIn.canCheckIn).toBe(
      false,
    );
  });

  it('says when check-in opens using the server instant, and closed after it', () => {
    const early = buildMyAttendanceScreenView(params({ selfRecord: recordInState('not_open') }));
    expect(early.checkIn.stateMessage).toContain('attendance.checkInOpensAt');
    expect(early.checkIn.canCheckIn).toBe(false);

    const late = buildMyAttendanceScreenView(params({ selfRecord: recordInState('closed') }));
    expect(late.checkIn.stateMessage).toBe('attendance.checkInClosed');
    expect(late.checkIn.canCheckIn).toBe(false);
  });

  it('shows the recorded chip and who recorded it', () => {
    const self = buildMyAttendanceScreenView(
      params({
        selfRecord: recordInState('recorded', { status: 'present_on_time', source: 'self' }),
      }),
    );
    expect(self.checkIn.statusChip?.label).toBe('attendance.statusPresent');
    expect(self.checkIn.stateMessage).toBe('attendance.checkInRecordedSelf');
    expect(self.checkIn.canCheckIn).toBe(false);

    const coach = buildMyAttendanceScreenView(
      params({ selfRecord: recordInState('recorded', { status: 'excused', source: 'coach' }) }),
    );
    expect(coach.checkIn.stateMessage).toBe('attendance.checkInRecordedStaff');
  });

  it('renders the locked state for a finalized sheet', () => {
    const view = buildMyAttendanceScreenView(params({ selfRecord: recordInState('locked') }));

    expect(view.checkIn.stateMessage).toBe('attendance.checkInLocked');
    expect(view.checkIn.canCheckIn).toBe(false);
  });

  it('never arms without a server ruling — a blockless response reads closed or recorded', () => {
    const blocklessEmpty = buildMyAttendanceScreenView(
      params({ selfRecord: mapAttendanceSelfRecord(makeSelfRecordDto({ selfCheckIn: null })) }),
    );
    expect(blocklessEmpty.checkIn.canCheckIn).toBe(false);
    expect(blocklessEmpty.checkIn.stateMessage).toBe('attendance.checkInClosed');

    const blocklessRecorded = buildMyAttendanceScreenView(
      params({
        selfRecord: mapAttendanceSelfRecord(
          makeSelfRecordDto({ selfCheckIn: null, status: 'present_on_time', source: 'self' }),
        ),
      }),
    );
    expect(blocklessRecorded.checkIn.stateMessage).toBe('attendance.checkInRecordedSelf');
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
});

describe('history section', () => {
  it('translates a recorded row with type, source, and no hints', () => {
    const view = buildMyAttendanceScreenView(params());

    const [row] = view.history.rows;
    expect(row?.statusLabel).toBe('attendance.statusPresent');
    expect(row?.statusTone).toBe('success');
    expect(row?.typeLabel).toBe('practice.typePractice');
    expect(row?.sourceLabel).toBe('attendance.checkInRecordedSelf');
    expect(row?.latenessLabel).toBeNull();
    expect(row?.excuseLabel).toBeNull();
    expect(row?.notFinalizedHint).toBeNull();
  });

  it('renders an unrecorded open-sheet row honestly, with lateness and excuse when present', () => {
    const view = buildMyAttendanceScreenView(
      params({
        history: mapAttendanceSelfHistory(
          makeSelfHistoryDto({
            items: [
              makeSelfHistoryEntryDto({
                status: null,
                source: null,
                recordedAt: null,
                sheetState: 'open',
                sessionType: 'unknown-drill',
              }),
              makeSelfHistoryEntryDto({
                sessionId: 'sess-h-2',
                status: 'present_late',
                latenessMinutes: 12,
                source: 'coach',
              }),
              makeSelfHistoryEntryDto({
                sessionId: 'sess-h-3',
                status: 'excused',
                excuseCategory: 'travel',
                source: 'coach',
              }),
            ],
            total: 3,
          }),
        ),
      }),
    );

    expect(view.history.rows).toMatchObject([
      {
        statusLabel: 'attendance.historyNotRecorded',
        statusTone: 'medium',
        sourceLabel: null,
        notFinalizedHint: 'attendance.historyNotFinalizedHint',
        // An unknown session type falls back to the server's literal value.
        typeLabel: 'unknown-drill',
      },
      {
        latenessLabel: 'attendance.historyLateness|{"minutes":12}',
        sourceLabel: 'attendance.checkInRecordedStaff',
      },
      { excuseLabel: 'attendance.excuseTravel' },
    ]);
  });

  it('offers load-more only while the window can still grow and rows remain', () => {
    const full = buildMyAttendanceScreenView(
      params({
        history: mapAttendanceSelfHistory(
          makeSelfHistoryDto({ items: [makeSelfHistoryEntryDto()], total: 25 }),
        ),
      }),
    );
    expect(full.history.canLoadMore).toBe(true);

    const complete = buildMyAttendanceScreenView(params());
    expect(complete.history.canLoadMore).toBe(false);

    const capped = buildMyAttendanceScreenView(
      params({
        canGrowHistory: false,
        history: mapAttendanceSelfHistory(
          makeSelfHistoryDto({ items: [makeSelfHistoryEntryDto()], total: 25 }),
        ),
      }),
    );
    expect(capped.history.canLoadMore).toBe(false);
  });

  it('keeps the loading and empty answers apart', () => {
    const loading = buildMyAttendanceScreenView(
      params({ history: undefined, isHistoryLoading: true }),
    );
    expect(loading.history.isLoading).toBe(true);
    expect(loading.history.rows).toEqual([]);

    const empty = buildMyAttendanceScreenView(
      params({ history: mapAttendanceSelfHistory(makeSelfHistoryDto({ items: [], total: 0 })) }),
    );
    expect(empty.history.isLoading).toBe(false);
    expect(empty.history.rows).toEqual([]);
    expect(empty.history.emptyTitle).toBe('attendance.selfEmptyTitle');
  });
});
