import { describe, expect, it, vi } from 'vitest';

import type { Drill } from '../types/drills.types';
import { buildDrillCard } from './drill-card.helper';

const t = vi.fn((key: string, params?: Record<string, unknown>) =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`,
);

function drill(overrides: Partial<Drill> & { id: string }): Drill {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: 'Build first-throw decision speed.',
    instructions: 'Pairs exchange give-and-go passes.',
    equipment: [],
    intensity: 'moderate',
    defaultDurationMinutes: 15,
    skillTags: ['throwing'],
    safetyNotes: null,
    mediaUrl: null,
    status: 'active',
    version: 1,
    ...overrides,
  };
}

describe('buildDrillCard', () => {
  it('projects an active drill into a fully-translated card', () => {
    const card = buildDrillCard(t, drill({ id: 'd1' }));

    expect(card).toEqual({
      id: 'd1',
      name: 'Give-and-go break',
      categoryLabel: 'drills.categoryThrowing',
      intensityLabel: 'drills.intensityModerate',
      durationLabel: 'drills.durationLabel:{"minutes":15}',
      statusLabel: 'drills.statusActive',
      statusTone: 'success',
      tagsSummary: 'throwing',
      ariaLabel: 'Give-and-go break',
    });
  });

  it('projects an archived drill through the same card, with the archived tone', () => {
    const card = buildDrillCard(
      t,
      drill({
        id: 'd2',
        name: 'Zone breakdown',
        status: 'archived',
        defaultDurationMinutes: null,
        skillTags: [],
      }),
    );

    expect(card.statusLabel).toBe('drills.statusArchived');
    expect(card.statusTone).toBe('medium');
    expect(card.durationLabel).toBe('drills.noDurationLabel');
    expect(card.tagsSummary).toBe('drills.noTagsLabel');
  });
});
