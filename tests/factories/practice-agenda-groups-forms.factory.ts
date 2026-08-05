import { vi } from 'vitest';

import type { AgendaGroupsFormsView } from '@/modules/practice-agenda-groups/hooks/use-agenda-groups-forms.hook';

/**
 * A rest-state forms stub shared by every hook test in this module that
 * needs one: `use-agenda-groups-actions`, `use-agenda-groups-mutations`, and
 * `use-practice-agenda-groups-screen` each take an `AgendaGroupsFormsView` as
 * a collaborator, and each test file needs the same idle shape to hand it.
 */
export function buildAgendaGroupsFormsStub(
  overrides: Partial<AgendaGroupsFormsView> = {},
): AgendaGroupsFormsView {
  return {
    createForm: { name: '', color: '', coachMembershipId: '', notes: '' },
    setCreateField: vi.fn(),
    resetCreateForm: vi.fn(),
    copySourceSessionId: '',
    setCopySourceSessionId: vi.fn(),
    resetCopyForm: vi.fn(),
    addMemberValues: {},
    setAddMemberValue: vi.fn(),
    resetAddMemberValue: vi.fn(),
    ...overrides,
  };
}
