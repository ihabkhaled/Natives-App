import { describe, expect, it, vi } from 'vitest';

import { EMPTY_COMPOSER_STATE } from '../constants/training-form.constants';
import type {
  TrainingBuddyEditorView,
  TrainingEvidenceEditorView,
} from '../types/training-view.types';
import type { ActivityType } from '../types/training.types';
import { buildComposerView } from './composer-view.helper';

const t = (key: string): string => key;

const EVIDENCE = { heading: 'e' } as unknown as TrainingEvidenceEditorView;
const BUDDIES = { heading: 'b' } as unknown as TrainingBuddyEditorView;

const CALLBACKS = {
  onTypeChange: vi.fn(),
  onDateChange: vi.fn(),
  onDurationChange: vi.fn(),
  onQuantityChange: vi.fn(),
  onNotesChange: vi.fn(),
  onSave: vi.fn(),
};

function activityType(overrides: Partial<ActivityType> = {}): ActivityType {
  return {
    id: 'type-gym',
    typeKey: 'gym',
    name: 'Gym',
    description: '',
    category: 'gym',
    unit: null,
    candidatePointValue: 5,
    pointsApproval: 'approved',
    requiresEvidence: false,
    minDurationMinutes: 20,
    maxDurationMinutes: 180,
    catalogVersion: 1,
    ...overrides,
  };
}

function build(selectedType: ActivityType | null, validationKey: string | null, isSaving = false) {
  return buildComposerView(
    t,
    {
      form: EMPTY_COMPOSER_STATE,
      activityTypes: selectedType === null ? [] : [selectedType],
      selectedType,
      validationKey,
      isSaving,
      dateMax: '2026-07-21',
      dateLocale: 'en',
      evidence: EVIDENCE,
      buddies: BUDDIES,
    },
    CALLBACKS,
  );
}

describe('buildComposerView', () => {
  it('hides the amount field until a type declares a unit', () => {
    expect(build(activityType(), null).showsQuantity).toBe(false);
    expect(build(activityType({ unit: 'reps' }), null).showsQuantity).toBe(true);
  });

  it('appends the unit to the amount label only when there is one', () => {
    expect(build(activityType(), null).quantityLabel).toBe('training.quantityLabel');
    expect(build(activityType({ unit: 'reps' }), null).quantityLabel).toBe(
      'training.quantityLabel (reps)',
    );
    expect(build(null, null).quantityLabel).toBe('training.quantityLabel');
  });

  it('shows the duration hint only when both bounds are published', () => {
    expect(build(activityType(), null).durationHint).toBe('training.durationHint');
    expect(build(activityType({ maxDurationMinutes: null }), null).durationHint).toBeNull();
    expect(build(null, null).durationHint).toBeNull();
  });

  it('blocks saving while validation fails or a save is already running', () => {
    expect(build(activityType(), 'training.validationDateRequired').canSave).toBe(false);
    expect(build(activityType(), null, true).canSave).toBe(false);
    expect(build(activityType(), null).canSave).toBe(true);
  });

  it('swaps the save label while a save is in flight', () => {
    expect(build(activityType(), null).saveLabel).toBe('training.saveDraft');
    expect(build(activityType(), null, true).saveLabel).toBe('training.savingDraft');
  });

  it('surfaces the first violated rule as the validation message', () => {
    expect(build(activityType(), 'training.validationDateFuture').validationMessage).toBe(
      'training.validationDateFuture',
    );
    expect(build(activityType(), null).validationMessage).toBeNull();
  });
});
