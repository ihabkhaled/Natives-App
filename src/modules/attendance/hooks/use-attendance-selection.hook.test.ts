import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAttendanceSelection } from './use-attendance-selection.hook';

describe('useAttendanceSelection', () => {
  it('toggles a member into and out of the selection', () => {
    const { result } = renderHook(() => useAttendanceSelection());

    act(() => {
      result.current.toggleMember('m-1');
    });
    expect(result.current.selectedIds).toEqual(['m-1']);

    act(() => {
      result.current.toggleMember('m-1');
    });
    expect(result.current.selectedIds).toEqual([]);
  });

  it('replaces and clears the whole selection', () => {
    const { result } = renderHook(() => useAttendanceSelection());

    act(() => {
      result.current.selectMembers(['m-1', 'm-2']);
    });
    expect(result.current.selectedIds).toEqual(['m-1', 'm-2']);

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIds).toEqual([]);
  });
});
