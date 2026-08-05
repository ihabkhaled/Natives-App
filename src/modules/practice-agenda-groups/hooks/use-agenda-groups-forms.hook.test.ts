import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAgendaGroupsForms } from './use-agenda-groups-forms.hook';

describe('useAgendaGroupsForms', () => {
  it('starts every field empty', () => {
    const { result } = renderHook(() => useAgendaGroupsForms());

    expect(result.current.createForm).toEqual({
      name: '',
      color: '',
      coachMembershipId: '',
      notes: '',
    });
    expect(result.current.copySourceSessionId).toBe('');
    expect(result.current.addMemberValues).toEqual({});
  });

  it('sets one create-form field without disturbing the others', () => {
    const { result } = renderHook(() => useAgendaGroupsForms());

    act(() => {
      result.current.setCreateField('name', 'Reds');
    });
    act(() => {
      result.current.setCreateField('notes', 'Attackers');
    });

    expect(result.current.createForm).toEqual({
      name: 'Reds',
      color: '',
      coachMembershipId: '',
      notes: 'Attackers',
    });
  });

  it('resets the create form back to empty', () => {
    const { result } = renderHook(() => useAgendaGroupsForms());

    act(() => {
      result.current.setCreateField('name', 'Reds');
    });
    act(() => {
      result.current.resetCreateForm();
    });

    expect(result.current.createForm.name).toBe('');
  });

  it('tracks and resets the copy-source field', () => {
    const { result } = renderHook(() => useAgendaGroupsForms());

    act(() => {
      result.current.setCopySourceSessionId('s2');
    });
    expect(result.current.copySourceSessionId).toBe('s2');

    act(() => {
      result.current.resetCopyForm();
    });
    expect(result.current.copySourceSessionId).toBe('');
  });

  /**
   * Two groups may be open at once; typing into one group's add-member field
   * must not clear what was typed into another's.
   */
  it('keeps one add-member value per group', () => {
    const { result } = renderHook(() => useAgendaGroupsForms());

    act(() => {
      result.current.setAddMemberValue('group-1', 'membership-1');
    });
    act(() => {
      result.current.setAddMemberValue('group-2', 'membership-2');
    });

    expect(result.current.addMemberValues).toEqual({
      'group-1': 'membership-1',
      'group-2': 'membership-2',
    });

    act(() => {
      result.current.resetAddMemberValue('group-1');
    });

    expect(result.current.addMemberValues).toEqual({
      'group-1': '',
      'group-2': 'membership-2',
    });
  });
});
