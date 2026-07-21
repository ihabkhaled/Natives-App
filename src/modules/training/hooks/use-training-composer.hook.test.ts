import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ActivityType } from '../types/training.types';
import { useTrainingComposer } from './use-training-composer.hook';

vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key, locale: 'en' }),
  getActiveLocale: () => 'en',
}));

vi.mock('@/packages/date', () => ({
  cairoDayKey: () => '2026-07-13',
  nowIso: () => '2026-07-13T09:00:00.000Z',
  formatDate: (iso: string, locale: string) => `${locale}:${iso}`,
}));

const GYM: ActivityType = {
  id: 'type-gym',
  typeKey: 'gym',
  name: 'Gym',
  description: '',
  category: 'gym',
  unit: 'reps',
  candidatePointValue: 5,
  pointsApproval: 'approved',
  requiresEvidence: false,
  minDurationMinutes: 20,
  maxDurationMinutes: 180,
  catalogVersion: 1,
};

function setup(onSave = vi.fn()) {
  return {
    onSave,
    ...renderHook(() =>
      useTrainingComposer({
        activityTypes: [GYM],
        buddyOptions: [
          { value: 'm-2', label: 'Sara' },
          { value: 'm-3', label: 'Omar' },
        ],
        isSaving: false,
        onSave,
      }),
    ),
  };
}

describe('useTrainingComposer', () => {
  it('starts empty, invalid, and with no candidate value to show', () => {
    const { result } = setup();

    expect(result.current.canSave).toBe(false);
    expect(result.current.hasCandidate).toBe(false);
    expect(result.current.showsQuantity).toBe(false);
  });

  it('shows no date at all until one is chosen, then shows the formatted day', () => {
    const { result } = setup();

    expect(result.current.dateValue).toBe('');
    expect(result.current.dateDisplayValue).toBe('');

    act(() => {
      result.current.onDateChange('2026-07-12');
    });

    expect(result.current.dateDisplayValue).toBe('en:2026-07-12');
  });

  it('opens the picker on demand and closes it the moment a day is chosen', () => {
    const { result } = setup();

    expect(result.current.isDateOpen).toBe(false);

    act(() => {
      result.current.onDateOpen();
    });
    expect(result.current.isDateOpen).toBe(true);

    act(() => {
      result.current.onDateChange('2026-07-12');
    });
    expect(result.current.isDateOpen).toBe(false);
  });

  it('closes the picker when it is dismissed without a choice', () => {
    const { result } = setup();

    act(() => {
      result.current.onDateOpen();
    });
    act(() => {
      result.current.onDateDismiss();
    });

    expect(result.current.isDateOpen).toBe(false);
    expect(result.current.dateValue).toBe('');
  });

  it('reveals the candidate value and the amount field once a type is chosen', () => {
    const { result } = setup();

    act(() => {
      result.current.onTypeChange('type-gym');
    });

    expect(result.current.hasCandidate).toBe(true);
    expect(result.current.showsQuantity).toBe(true);
    expect(result.current.durationHint).toBe('training.durationHint');
  });

  it('collects every field the composer offers', () => {
    const { result } = setup();

    act(() => {
      result.current.onTypeChange('type-gym');
    });
    act(() => {
      result.current.onDateChange('2026-07-12');
      result.current.onDurationChange('45');
    });
    act(() => {
      result.current.onQuantityChange('30');
      result.current.onNotesChange('Tempo run.');
    });

    expect(result.current.dateValue).toBe('2026-07-12');
    expect(result.current.durationValue).toBe('45');
    expect(result.current.quantityValue).toBe('30');
    expect(result.current.notesValue).toBe('Tempo run.');
    expect(result.current.canSave).toBe(true);
  });

  it('caps the date picker at the current Cairo day and carries the active locale', () => {
    const { result } = setup();

    expect(result.current.dateMax).toBe('2026-07-13');
    expect(result.current.dateLocale).toBe('en');
  });

  it('adds and removes an evidence metadata row', () => {
    const { result } = setup();

    act(() => {
      result.current.evidence.onKindChange('note');
    });
    act(() => {
      result.current.evidence.onReferenceChange('ref-1');
      result.current.evidence.onDescriptionChange('why');
    });
    expect(result.current.evidence.canAdd).toBe(true);

    act(() => {
      result.current.evidence.onAdd();
    });
    expect(result.current.evidence.items).toHaveLength(1);

    act(() => {
      result.current.evidence.onRemove('note-0');
    });
    expect(result.current.evidence.items).toHaveLength(0);
  });

  it('adds and removes a training buddy', () => {
    const { result } = setup();

    act(() => {
      result.current.buddies.onValueChange('m-2');
    });
    expect(result.current.buddies.canAdd).toBe(true);

    act(() => {
      result.current.buddies.onAdd();
    });
    expect(result.current.buddies.selected).toEqual([{ value: 'm-2', label: 'Sara' }]);

    act(() => {
      result.current.buddies.onRemove('m-2');
    });
    expect(result.current.buddies.selected).toEqual([]);
  });

  it('refuses to save an invalid claim and clears the form after a valid one', () => {
    const onSave = vi.fn();
    const { result } = setup(onSave);

    act(() => {
      result.current.onSave();
    });
    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      result.current.onTypeChange('type-gym');
    });
    act(() => {
      result.current.onDateChange('2026-07-12');
    });
    act(() => {
      result.current.onSave();
    });

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ activityTypeId: 'type-gym', performedOn: '2026-07-12' }),
    );
    expect(result.current.typeValue).toBe('');
  });
});
