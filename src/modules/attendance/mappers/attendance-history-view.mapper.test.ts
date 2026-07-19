import { describe, expect, it } from 'vitest';

import type { AttendanceRevision } from '../types/attendance.types';
import { mapAttendanceHistoryView } from './attendance-history-view.mapper';

const t = (key: string): string => key;

const BASE_REVISION: AttendanceRevision = {
  id: 'rev-1',
  fromStatus: 'absent',
  toStatus: 'present_on_time',
  latenessMinutes: null,
  excuseCategory: null,
  correctionReason: 'scanner outage',
  occurredAtIso: '2026-07-26T15:05:00.000Z',
};

describe('mapAttendanceHistoryView', () => {
  it('builds a labelled transition from a known previous status', () => {
    const [view] = mapAttendanceHistoryView(t, 'en', [BASE_REVISION]);

    expect(view?.id).toBe('rev-1');
    expect(view?.transitionLabel).toBe('attendance.revisionChanged');
    expect(view?.reason).toBe('scanner outage');
    expect(view?.occurredLabel).toBe('attendance.correctedAt');
  });

  it('labels an unmarked previous status when fromStatus is null', () => {
    const [view] = mapAttendanceHistoryView(t, 'en', [
      { ...BASE_REVISION, fromStatus: null, correctionReason: null },
    ]);

    expect(view?.reason).toBeNull();
    expect(view?.transitionLabel).toBe('attendance.revisionChanged');
  });

  it('maps an empty history to an empty view list', () => {
    expect(mapAttendanceHistoryView(t, 'en', [])).toEqual([]);
  });
});
