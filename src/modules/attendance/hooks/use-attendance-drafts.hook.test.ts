import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeQueuedOperation, makeRosterEntry } from '@/tests/msw/attendance-domain.fixture';

import { useAttendanceDrafts } from './use-attendance-drafts.hook';

const ENTRIES = [
  makeRosterEntry({ membershipId: 'm-1', status: null }),
  makeRosterEntry({ membershipId: 'm-2', status: 'absent' }),
];

describe('useAttendanceDrafts', () => {
  it('marks everyone present and exposes the dirty rows, then reverts on undo', () => {
    const { result } = renderHook(() => useAttendanceDrafts(ENTRIES, []));

    act(() => {
      result.current.markAllPresent();
    });
    expect(result.current.dirtyIds).toContain('m-1');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.buildMarks()).toHaveLength(2);

    act(() => {
      result.current.undo();
    });
    expect(result.current.dirtyIds).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it('ignores undo when there is nothing to revert', () => {
    const { result } = renderHook(() => useAttendanceDrafts(ENTRIES, []));

    act(() => {
      result.current.undo();
    });
    expect(result.current.dirtyIds).toEqual([]);
  });

  it('edits a single row and clears lateness/excuse when leaving those statuses', () => {
    const { result } = renderHook(() => useAttendanceDrafts(ENTRIES, []));

    act(() => {
      result.current.setStatus('m-1', 'present_late');
    });
    act(() => {
      result.current.setLateness('m-1', '15');
    });
    expect(result.current.drafts['m-1']?.latenessMinutes).toBe(15);

    act(() => {
      result.current.setStatus('m-1', 'excused');
    });
    act(() => {
      result.current.setExcuse('m-1', 'travel');
    });
    expect(result.current.drafts['m-1']?.latenessMinutes).toBeNull();
    expect(result.current.drafts['m-1']?.excuseCategory).toBe('travel');

    act(() => {
      result.current.setStatus('m-1', 'present_on_time');
    });
    expect(result.current.drafts['m-1']?.excuseCategory).toBeNull();
  });

  it('captures a correction reason and accepts changes', () => {
    const { result } = renderHook(() => useAttendanceDrafts(ENTRIES, []));

    act(() => {
      result.current.setCorrectionReason('m-2', 'scanner outage');
    });
    expect(result.current.drafts['m-2']?.correctionReason).toBe('scanner outage');

    act(() => {
      result.current.acceptChanges();
    });
    expect(result.current.dirtyIds).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it('ignores edits to an unknown membership id', () => {
    const { result } = renderHook(() => useAttendanceDrafts(ENTRIES, []));

    act(() => {
      result.current.setStatus('m-missing', 'absent');
    });
    expect(result.current.dirtyIds).toEqual([]);
  });

  it('seeds drafts from a pending queued operation', () => {
    const { result } = renderHook(() =>
      useAttendanceDrafts(ENTRIES, [
        makeQueuedOperation({ membershipId: 'm-1', status: 'present_late', latenessMinutes: 4 }),
      ]),
    );

    expect(result.current.drafts['m-1']?.status).toBe('present_late');
  });
});
