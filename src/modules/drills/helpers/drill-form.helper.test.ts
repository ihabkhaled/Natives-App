import { describe, expect, it } from 'vitest';

import { DRILL_DEFAULT_INTENSITY } from '../constants/drills.constants';
import type { Drill, DrillFormValues } from '../types/drills.types';
import {
  buildDrillFormDefaultValues,
  toCreateDrillCommand,
  toUpdateDrillCommand,
} from './drill-form.helper';

function drill(overrides: Partial<Drill> = {}): Drill {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: 'Build first-throw decision speed.',
    instructions: 'Pairs exchange give-and-go passes.',
    equipment: ['cones', 'discs'],
    intensity: 'high',
    defaultDurationMinutes: 15,
    skillTags: ['throwing', 'footwork'],
    safetyNotes: 'Keep pairs spaced.',
    mediaUrl: 'https://example.com/clip.mp4',
    status: 'active',
    version: 3,
    id: 'd1',
    ...overrides,
  };
}

describe('buildDrillFormDefaultValues', () => {
  it('starts every field blank for a brand-new drill, with a real intensity default', () => {
    expect(buildDrillFormDefaultValues(null)).toEqual({
      name: '',
      category: '',
      intensity: DRILL_DEFAULT_INTENSITY,
      objective: '',
      instructions: '',
      equipment: '',
      skillTags: '',
      defaultDurationMinutes: '',
      safetyNotes: '',
      mediaUrl: '',
    });
  });

  it('returns the same reference for repeated null input, so the form does not reset itself', () => {
    expect(buildDrillFormDefaultValues(null)).toBe(buildDrillFormDefaultValues(null));
  });

  it('seeds every field from a fully-populated drill', () => {
    expect(buildDrillFormDefaultValues(drill())).toEqual({
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
      objective: 'Build first-throw decision speed.',
      instructions: 'Pairs exchange give-and-go passes.',
      equipment: 'cones, discs',
      skillTags: 'throwing, footwork',
      defaultDurationMinutes: '15',
      safetyNotes: 'Keep pairs spaced.',
      mediaUrl: 'https://example.com/clip.mp4',
    });
  });

  it('blanks the optional fields a drill never set', () => {
    const values = buildDrillFormDefaultValues(
      drill({
        objective: null,
        instructions: null,
        defaultDurationMinutes: null,
        safetyNotes: null,
        mediaUrl: null,
        equipment: [],
        skillTags: [],
      }),
    );

    expect(values.objective).toBe('');
    expect(values.instructions).toBe('');
    expect(values.defaultDurationMinutes).toBe('');
    expect(values.safetyNotes).toBe('');
    expect(values.mediaUrl).toBe('');
    expect(values.equipment).toBe('');
    expect(values.skillTags).toBe('');
  });
});

const FORM_VALUES: DrillFormValues = {
  name: '  Give-and-go break  ',
  category: 'throwing',
  intensity: 'high',
  objective: 'Build first-throw decision speed.',
  instructions: '',
  equipment: 'cones, discs',
  skillTags: '',
  defaultDurationMinutes: '15',
  safetyNotes: '',
  mediaUrl: '',
};

describe('toCreateDrillCommand', () => {
  it('trims the name and narrows the vocabulary fields', () => {
    const command = toCreateDrillCommand('team-1', FORM_VALUES);

    expect(command).toEqual({
      teamId: 'team-1',
      seasonId: null,
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
      objective: 'Build first-throw decision speed.',
      instructions: null,
      equipment: ['cones', 'discs'],
      skillTags: [],
      defaultDurationMinutes: 15,
      safetyNotes: null,
      mediaUrl: null,
    });
  });
});

describe('toUpdateDrillCommand', () => {
  it('carries the drill id and the optimistic version alongside the fields', () => {
    const command = toUpdateDrillCommand('team-1', 'd1', 3, FORM_VALUES);

    expect(command.teamId).toBe('team-1');
    expect(command.drillId).toBe('d1');
    expect(command.expectedVersion).toBe(3);
    expect(command.name).toBe('Give-and-go break');
    expect(command.equipment).toEqual(['cones', 'discs']);
  });
});
