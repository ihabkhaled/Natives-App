import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { PERMISSIONS } from '@/shared/security';

import type { ScheduleFormBindings } from '../helpers/schedule-detail-view.helper';
import type { PracticeSchedule } from '../types/practice-schedules.types';
import type { ScheduleFormValues } from '../types/practice-schedules-view.types';
import { usePracticeScheduleDetailScreen } from './use-practice-schedule-detail-screen.hook';
import { useScheduleForm } from './use-schedule-form.hook';
import { useScheduleMutations } from './use-schedule-mutations.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));
vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./use-schedule-form.hook', () => ({ useScheduleForm: vi.fn() }));
vi.mock('./use-schedule-mutations.hook', () => ({ useScheduleMutations: vi.fn() }));

const SCHEDULE: PracticeSchedule = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  defaultCapacity: null,
  visibility: 'team',
  organizerUserId: null,
  notes: null,
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: [],
  status: 'active',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  updatedAtIso: '2026-01-01T00:00:00.000Z',
  version: 5,
};

let formOnValidSubmit: (values: ScheduleFormValues) => void;
const onValidSubmit = vi.fn();
const onDelete = vi.fn();
const onGenerate = vi.fn();
const push = vi.fn();

function stubField(value = '') {
  return { name: 'f', value, onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [PERMISSIONS.practicesManage],
    isLoading: false,
  } as never);
  vi.mocked(useAppQuery).mockReturnValue({
    data: SCHEDULE,
    isPending: false,
    isError: false,
  } as never);
  vi.mocked(useAppNavigation).mockReturnValue({ push, replace: vi.fn(), goBack: vi.fn(), currentPath: '/x' });
  vi.mocked(useScheduleMutations).mockReturnValue({
    isSaving: false,
    isDeleting: false,
    isGenerating: false,
    messages: [],
    onValidSubmit,
    onDelete,
    onGenerate,
  });
  vi.mocked(useScheduleForm).mockImplementation((options) => {
    formOnValidSubmit = options.onValidSubmit;
    const bindings: ScheduleFormBindings = {
      nameField: stubField(),
      sessionTypeField: stubField(),
      frequencyField: stubField('weekly'),
      intervalWeeksField: stubField('1'),
      startTimeField: stubField(),
      durationField: stubField(),
      timezoneField: stubField(),
      generationStartField: stubField(),
      generationUntilField: stubField(),
      visibilityField: stubField('team'),
      capacityField: stubField(),
      notesField: stubField(),
      onSubmit: vi.fn(),
      onReset: vi.fn(),
    };
    return bindings;
  });
});

const VALID_FORM_VALUES: ScheduleFormValues = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly',
  intervalWeeks: '1',
  startTimeLocal: '18:00',
  durationMinutes: '90',
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team',
  defaultCapacity: '',
  notes: '',
};

describe('usePracticeScheduleDetailScreen', () => {
  it('is in create mode with no route id and never fires the detail read', () => {
    const { result } = renderHook(() => usePracticeScheduleDetailScreen(null));

    expect(result.current.isCreateMode).toBe(true);
    expect(useAppQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('is in edit mode once a route id is present', () => {
    const { result } = renderHook(() => usePracticeScheduleDetailScreen('s1'));

    expect(result.current.isCreateMode).toBe(false);
    expect(result.current.heading).toBe('Evening practice');
  });

  it('hands a schema-valid submit to the mutations hook as a parsed draft', () => {
    renderHook(() => usePracticeScheduleDetailScreen('s1'));

    formOnValidSubmit(VALID_FORM_VALUES);

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Evening practice', durationMinutes: 90 }),
    );
  });

  it('wires the delete and generate handlers straight through', () => {
    const { result } = renderHook(() => usePracticeScheduleDetailScreen('s1'));

    result.current.onDelete();
    result.current.onGenerate();

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('allows generate only while the loaded schedule is active', () => {
    const { result, rerender } = renderHook(() => usePracticeScheduleDetailScreen('s1'));
    expect(result.current.canGenerate).toBe(true);

    vi.mocked(useAppQuery).mockReturnValue({
      data: { ...SCHEDULE, status: 'archived' },
      isPending: false,
      isError: false,
    } as never);
    rerender();

    expect(result.current.canGenerate).toBe(false);
  });

  it('withholds the screen from a principal without practice.manage', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({ permissions: [], isLoading: false } as never);

    const { result } = renderHook(() => usePracticeScheduleDetailScreen('s1'));

    expect(result.current.isForbidden).toBe(true);
  });

  it('navigates to the list on back', () => {
    const { result } = renderHook(() => usePracticeScheduleDetailScreen('s1'));

    result.current.onBack();

    expect(push).toHaveBeenCalledWith('/practice-schedules');
  });
});
