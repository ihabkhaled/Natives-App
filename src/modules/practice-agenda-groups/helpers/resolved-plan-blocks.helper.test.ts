import { describe, expect, it } from 'vitest';

import {
  buildAgendaBlock,
  buildAgendaStation,
} from '../../../../tests/factories/practice-agenda-view.factory';
import type { AgendaGroup } from '../types/practice-agenda-groups.types';
import { buildResolvedBlockViews } from './resolved-plan-blocks.helper';

/** Echo the key back with its params, so assertions read as key + numbers. */
const translate = (key: string, params?: Readonly<Record<string, unknown>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function group(overrides: Partial<AgendaGroup> = {}): AgendaGroup {
  return {
    id: 'group-1',
    name: 'Handlers',
    color: null,
    coachMembershipId: null,
    position: 1,
    notes: null,
    members: [],
    ...overrides,
  };
}

describe('buildResolvedBlockViews', () => {
  it('reorders blocks and their stations by position rather than array order', () => {
    const blocks = [
      buildAgendaBlock({ id: 'b2', position: 2, title: 'Drill' }),
      buildAgendaBlock({
        id: 'b1',
        position: 1,
        title: 'Warm-up',
        stations: [
          buildAgendaStation({ id: 's2', blockId: 'b1', position: 2, name: 'Second' }),
          buildAgendaStation({ id: 's1', blockId: 'b1', position: 1, name: 'First' }),
        ],
      }),
    ];

    const views = buildResolvedBlockViews(translate, blocks, []);

    expect(views.map((view) => view.title)).toEqual(['Warm-up', 'Drill']);
    expect(views[0]?.stations.map((station) => station.name)).toEqual(['First', 'Second']);
  });

  it('produces no duration label for an untimed block', () => {
    const views = buildResolvedBlockViews(
      translate,
      [buildAgendaBlock({ durationMinutes: null })],
      [],
    );

    expect(views[0]?.durationLabel).toBeNull();
  });

  it('interpolates the duration for a timed block', () => {
    const views = buildResolvedBlockViews(
      translate,
      [buildAgendaBlock({ durationMinutes: 30 })],
      [],
    );

    expect(views[0]?.durationLabel).toBe('practice.agendaDuration:{"minutes":30}');
  });

  it("resolves a station's groupId to the group's name", () => {
    const blocks = [
      buildAgendaBlock({
        stations: [buildAgendaStation({ groupId: 'group-1', name: 'Deep cuts' })],
      }),
    ];

    const views = buildResolvedBlockViews(translate, blocks, [group({ name: 'Handlers' })]);

    expect(views[0]?.stations[0]?.groupLabel).toBe('Handlers');
  });

  it('reads a station with no groupId as unassigned', () => {
    const blocks = [
      buildAgendaBlock({ stations: [buildAgendaStation({ groupId: null, name: 'Deep cuts' })] }),
    ];

    const views = buildResolvedBlockViews(translate, blocks, []);

    expect(views[0]?.stations[0]?.groupLabel).toBe('practiceAgendaGroups.unassigned');
  });

  /**
   * A station may still name a `groupId` the coach has since removed. Falling
   * back to "unassigned" instead of an empty label is what keeps the plan
   * honest rather than showing a blank the coach would read as a bug.
   */
  it('reads a station whose group no longer exists as unassigned', () => {
    const blocks = [
      buildAgendaBlock({
        stations: [buildAgendaStation({ groupId: 'group-gone', name: 'Deep cuts' })],
      }),
    ];

    const views = buildResolvedBlockViews(translate, blocks, [group()]);

    expect(views[0]?.stations[0]?.groupLabel).toBe('practiceAgendaGroups.unassigned');
  });
});
