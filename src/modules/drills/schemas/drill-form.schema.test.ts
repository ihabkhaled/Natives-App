import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { DRILL_FIELD_LIMITS } from '../constants/drills.constants';
import { drillFormSchema } from './drill-form.schema';

const valid = {
  name: 'Give-and-go break',
  category: 'throwing',
  intensity: 'moderate',
  objective: 'Build first-throw decision speed.',
  instructions: 'Pairs exchange give-and-go passes.',
  equipment: 'cones, discs',
  skillTags: 'throwing, footwork',
  defaultDurationMinutes: '15',
  safetyNotes: '',
  mediaUrl: '',
};

function firstIssue(input: Record<string, string>): string {
  const result = drillFormSchema.safeParse(input);
  return result.success ? '' : (result.error.issues[0]?.message ?? '');
}

describe('drillFormSchema', () => {
  it('accepts a fully populated, valid drill', () => {
    expect(drillFormSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts the minimal case: only the two required fields', () => {
    expect(
      drillFormSchema.safeParse({
        ...valid,
        objective: '',
        instructions: '',
        equipment: '',
        skillTags: '',
        defaultDurationMinutes: '',
      }).success,
    ).toBe(true);
  });

  it('rejects a blank name', () => {
    expect(firstIssue({ ...valid, name: '   ' })).toBe(I18N_KEYS.drills.validationNameRequired);
  });

  it('rejects a name above the backend maximum', () => {
    expect(firstIssue({ ...valid, name: 'a'.repeat(DRILL_FIELD_LIMITS.nameMax + 1) })).toBe(
      I18N_KEYS.drills.validationNameTooLong,
    );
  });

  it('rejects a blank category', () => {
    expect(firstIssue({ ...valid, category: '' })).toBe(
      I18N_KEYS.drills.validationCategoryRequired,
    );
  });

  it('rejects an objective above the backend maximum', () => {
    expect(
      firstIssue({ ...valid, objective: 'a'.repeat(DRILL_FIELD_LIMITS.objectiveMax + 1) }),
    ).toBe(I18N_KEYS.drills.validationObjectiveTooLong);
  });

  it('rejects instructions above the backend maximum', () => {
    expect(
      firstIssue({ ...valid, instructions: 'a'.repeat(DRILL_FIELD_LIMITS.instructionsMax + 1) }),
    ).toBe(I18N_KEYS.drills.validationInstructionsTooLong);
  });

  it('rejects safety notes above the backend maximum', () => {
    expect(
      firstIssue({ ...valid, safetyNotes: 'a'.repeat(DRILL_FIELD_LIMITS.safetyNotesMax + 1) }),
    ).toBe(I18N_KEYS.drills.validationSafetyNotesTooLong);
  });

  it('rejects more equipment items than the backend allows', () => {
    const tooMany = Array.from(
      { length: DRILL_FIELD_LIMITS.equipmentMaxItems + 1 },
      (_, index) => `item-${String(index)}`,
    ).join(',');
    expect(firstIssue({ ...valid, equipment: tooMany })).toBe(
      I18N_KEYS.drills.validationEquipmentTooMany,
    );
  });

  it('rejects more skill tags than the backend allows', () => {
    const tooMany = Array.from(
      { length: DRILL_FIELD_LIMITS.skillTagsMaxItems + 1 },
      (_, index) => `tag-${String(index)}`,
    ).join(',');
    expect(firstIssue({ ...valid, skillTags: tooMany })).toBe(
      I18N_KEYS.drills.validationSkillTagsTooMany,
    );
  });

  it('rejects a duration outside the backend bounds', () => {
    expect(firstIssue({ ...valid, defaultDurationMinutes: '0' })).toBe(
      I18N_KEYS.drills.validationDurationRange,
    );
    expect(
      firstIssue({ ...valid, defaultDurationMinutes: String(DRILL_FIELD_LIMITS.durationMax + 1) }),
    ).toBe(I18N_KEYS.drills.validationDurationRange);
  });

  it('accepts a blank duration, since it is optional', () => {
    expect(drillFormSchema.safeParse({ ...valid, defaultDurationMinutes: '' }).success).toBe(true);
  });

  it('rejects a media link that is not https, because it becomes a clickable link', () => {
    expect(firstIssue({ ...valid, mediaUrl: 'http://example.com/clip.mp4' })).toBe(
      I18N_KEYS.drills.validationMediaUrlInvalid,
    );
    expect(firstIssue({ ...valid, mediaUrl: 'javascript:alert(1)' })).toBe(
      I18N_KEYS.drills.validationMediaUrlInvalid,
    );
  });

  it('accepts a blank media link', () => {
    expect(drillFormSchema.safeParse({ ...valid, mediaUrl: '' }).success).toBe(true);
  });

  it('accepts a valid https media link', () => {
    expect(
      drillFormSchema.safeParse({ ...valid, mediaUrl: 'https://example.com/clip.mp4' }).success,
    ).toBe(true);
  });

  it('rejects an overlong media link', () => {
    expect(
      firstIssue({
        ...valid,
        mediaUrl: `https://example.com/${'a'.repeat(DRILL_FIELD_LIMITS.mediaUrlMax)}`,
      }),
    ).toBe(I18N_KEYS.drills.validationMediaUrlTooLong);
  });
});
