import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeRosterEntry } from '@/tests/msw/attendance-domain.fixture';

import { useAttendanceEditor } from './use-attendance-editor.hook';

const ENTRIES = [
  makeRosterEntry({ membershipId: 'm-1', status: null }),
  makeRosterEntry({ membershipId: 'm-2', status: null }),
];

describe('useAttendanceEditor', () => {
  it('marks the current selection with a status', () => {
    const { result } = renderHook(() => useAttendanceEditor(ENTRIES, []));

    act(() => {
      result.current.selectMembers(['m-1']);
    });
    act(() => {
      result.current.markSelected('absent');
    });

    expect(result.current.drafts['m-1']?.status).toBe('absent');
    expect(result.current.dirtyIds).toContain('m-1');
  });

  it('clears drafts and selection together on acceptChanges', () => {
    const { result } = renderHook(() => useAttendanceEditor(ENTRIES, []));

    act(() => {
      result.current.selectMembers(['m-1', 'm-2']);
    });
    act(() => {
      result.current.markSelected('present_on_time');
    });
    act(() => {
      result.current.acceptChanges();
    });

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.dirtyIds).toEqual([]);
  });
});
