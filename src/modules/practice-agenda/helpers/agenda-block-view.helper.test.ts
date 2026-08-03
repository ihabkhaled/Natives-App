import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import {
  buildAgendaBlock,
  buildAgendaStation,
} from '../../../../tests/factories/practice-agenda-view.factory';
import { buildAgendaBlockViews } from './agenda-block-view.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

describe('buildAgendaBlockViews', () => {
  it('renders the coach’s own words for the block rather than a lookup key', () => {
    const [view] = buildAgendaBlockViews(t, [
      buildAgendaBlock({ title: 'Cutting drill', notes: 'Rotate every eight minutes.' }),
    ]);

    expect(view?.title).toBe('Cutting drill');
    expect(view?.notes).toBe('Rotate every eight minutes.');
  });

  it('states a duration through the shared practice wording', () => {
    const [view] = buildAgendaBlockViews(t, [buildAgendaBlock({ durationMinutes: 30 })]);

    expect(view?.durationLabel).toBe(`t:${I18N_KEYS.practice.agendaDuration}:{"minutes":30}`);
  });

  it('leaves an untimed block without a duration instead of calling it zero minutes', () => {
    const [view] = buildAgendaBlockViews(t, [buildAgendaBlock({ durationMinutes: null })]);

    expect(view?.durationLabel).toBeNull();
  });

  it('runs the stations of a block in position order', () => {
    const [view] = buildAgendaBlockViews(t, [
      buildAgendaBlock({
        stations: [
          buildAgendaStation({ id: 'st2', position: 2, name: 'Deep cuts' }),
          buildAgendaStation({ id: 'st1', position: 1, name: 'Under cuts' }),
        ],
      }),
    ]);

    expect(view?.stations.map((station) => station.name)).toEqual(['Under cuts', 'Deep cuts']);
  });

  it('carries the station target as its detail, and null when it has none', () => {
    const [view] = buildAgendaBlockViews(t, [
      buildAgendaBlock({
        stations: [
          buildAgendaStation({ id: 'st1', target: 'Sharp change of pace' }),
          buildAgendaStation({ id: 'st2', position: 2, target: null }),
        ],
      }),
    ]);

    expect(view?.stations[0]?.detail).toBe('Sharp change of pace');
    expect(view?.stations[1]?.detail).toBeNull();
  });

  it('keeps the block order it was handed, having no opinion of its own', () => {
    // The caller has already chosen between the server order and the coach's
    // provisional one; re-sorting here would silently overrule that choice.
    const views = buildAgendaBlockViews(t, [
      buildAgendaBlock({ id: 'b2', position: 2 }),
      buildAgendaBlock({ id: 'b1', position: 1 }),
    ]);

    expect(views.map((view) => view.id)).toEqual(['b2', 'b1']);
  });

  it('names the station under the block that holds it', () => {
    const [view] = buildAgendaBlockViews(t, [
      buildAgendaBlock({ id: 'b7', stations: [buildAgendaStation({ blockId: 'b7' })] }),
    ]);

    expect(view?.stations[0]?.blockId).toBe('b7');
  });
});
