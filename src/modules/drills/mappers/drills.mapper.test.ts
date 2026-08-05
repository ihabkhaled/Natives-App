import { describe, expect, it } from 'vitest';

import type { CreateDrillCommand, UpdateDrillCommand } from '../types/drills.types';
import { toCreateDrillDto, toUpdateDrillDto } from './drills.mapper';

const CREATE_COMMAND: CreateDrillCommand = {
  teamId: 't1',
  seasonId: 's1',
  name: 'Give-and-go break',
  category: 'throwing',
  intensity: 'high',
  objective: 'Build first-throw decision speed.',
  instructions: null,
  equipment: ['cones'],
  skillTags: [],
  defaultDurationMinutes: 15,
  safetyNotes: null,
  mediaUrl: null,
};

describe('toCreateDrillDto', () => {
  it('carries every populated field onto the wire shape', () => {
    expect(toCreateDrillDto(CREATE_COMMAND)).toEqual({
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
      objective: 'Build first-throw decision speed.',
      instructions: undefined,
      equipment: ['cones'],
      skillTags: [],
      defaultDurationMinutes: 15,
      safetyNotes: undefined,
      mediaUrl: undefined,
      seasonId: 's1',
    });
  });

  it('omits every blank optional field rather than sending it as null', () => {
    const dto = toCreateDrillDto({
      ...CREATE_COMMAND,
      seasonId: null,
      objective: null,
      defaultDurationMinutes: null,
    });

    expect('seasonId' in dto).toBe(true);
    expect(dto.seasonId).toBeUndefined();
    expect(dto.objective).toBeUndefined();
    expect(dto.defaultDurationMinutes).toBeUndefined();
    // Confirms the collapse target is `undefined`, which JSON.stringify drops
    // — never `null`, which the DTO's optional-but-not-nullable fields reject.
    expect(JSON.parse(JSON.stringify(dto))).not.toHaveProperty('objective');
  });
});

const UPDATE_COMMAND: UpdateDrillCommand = {
  teamId: 't1',
  drillId: 'd1',
  expectedVersion: 4,
  name: 'Give-and-go break',
  category: 'throwing',
  intensity: 'high',
  objective: null,
  instructions: null,
  equipment: [],
  skillTags: [],
  defaultDurationMinutes: null,
  safetyNotes: null,
  mediaUrl: null,
};

describe('toUpdateDrillDto', () => {
  it('carries the expected version rather than the create-only seasonId', () => {
    const dto = toUpdateDrillDto(UPDATE_COMMAND);

    expect(dto.expectedVersion).toBe(4);
    expect('seasonId' in dto).toBe(false);
  });

  it('collapses every blank optional field to undefined', () => {
    const dto = toUpdateDrillDto(UPDATE_COMMAND);

    expect(dto.objective).toBeUndefined();
    expect(dto.instructions).toBeUndefined();
    expect(dto.safetyNotes).toBeUndefined();
    expect(dto.mediaUrl).toBeUndefined();
    expect(dto.defaultDurationMinutes).toBeUndefined();
  });
});
