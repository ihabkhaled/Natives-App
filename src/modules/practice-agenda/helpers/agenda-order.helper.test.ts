import { describe, expect, it } from 'vitest';

import { buildAgendaBlock } from '../../../../tests/factories/practice-agenda-view.factory';
import type { AgendaBlock, PracticeAgenda } from '../types/practice-agenda.types';
import { resolveAgendaState, resolveBlockOrder, toBlockIds } from './agenda-order.helper';

const first = buildAgendaBlock({ id: 'b1', position: 1, title: 'Warm-up' });
const second = buildAgendaBlock({ id: 'b2', position: 2, title: 'Drill' });
const third = buildAgendaBlock({ id: 'b3', position: 3, title: 'Scrimmage' });
const shuffled = [third, first, second];

function agendaWith(version: number | null, blocks: readonly AgendaBlock[]): PracticeAgenda {
  return {
    sessionId: 's1',
    agendaId: version === null ? null : 'a1',
    status: version === null ? null : 'draft',
    theme: null,
    notes: null,
    publishedAt: null,
    completedAt: null,
    version,
    blocks: [...blocks],
  };
}

describe('resolveAgendaState', () => {
  it('defaults a plan that has not arrived to no blocks and no version', () => {
    expect(resolveAgendaState(undefined)).toEqual({ blocks: [], version: null });
  });

  it('reports the version the blocks were read at', () => {
    expect(resolveAgendaState(agendaWith(7, [first]))).toEqual({ blocks: [first], version: 7 });
  });

  it('treats a plan nobody has created yet as versionless, not version zero', () => {
    // `null` is the server saying there is no draft; coercing it to 0 would
    // send a guard the server never issued.
    expect(resolveAgendaState(agendaWith(null, [])).version).toBeNull();
  });
});

describe('resolveBlockOrder', () => {
  it('trusts position, not the order the wire happened to serialize', () => {
    expect(toBlockIds(resolveBlockOrder(shuffled, null, 4))).toEqual(['b1', 'b2', 'b3']);
  });

  it('draws the order a coach just made, before the server has confirmed it', () => {
    const pending = { version: 4, ids: ['b2', 'b1', 'b3'] };

    expect(toBlockIds(resolveBlockOrder(shuffled, pending, 4))).toEqual(['b2', 'b1', 'b3']);
  });

  it('gives the provisional order up as soon as the server reports a new version', () => {
    // An accepted reorder bumps the version, so the re-read plan — not the
    // coach's guess — is what stays on screen.
    const pending = { version: 4, ids: ['b3', 'b2', 'b1'] };

    expect(toBlockIds(resolveBlockOrder(shuffled, pending, 5))).toEqual(['b1', 'b2', 'b3']);
  });

  it('honours a provisional order drawn against a plan that has no version yet', () => {
    const pending = { version: null, ids: ['b2', 'b1', 'b3'] };

    expect(toBlockIds(resolveBlockOrder(shuffled, pending, null))).toEqual(['b2', 'b1', 'b3']);
  });

  it('drops an id the server no longer knows', () => {
    const pending = { version: 4, ids: ['b2', 'gone', 'b1', 'b3'] };

    expect(toBlockIds(resolveBlockOrder(shuffled, pending, 4))).toEqual(['b2', 'b1', 'b3']);
  });

  it('keeps a block the provisional order never mentioned', () => {
    // Another coach added it while this one was rearranging; dropping it would
    // delete a block from the plan on screen that the session will still run.
    const pending = { version: 4, ids: ['b2', 'b1'] };

    expect(toBlockIds(resolveBlockOrder(shuffled, pending, 4))).toEqual(['b2', 'b1', 'b3']);
  });

  it('sorts a copy, leaving the array it was handed untouched', () => {
    resolveBlockOrder(shuffled, null, 4);

    expect(toBlockIds(shuffled)).toEqual(['b3', 'b1', 'b2']);
  });
});

describe('toBlockIds', () => {
  it('reads ids in the order they are drawn', () => {
    expect(toBlockIds([second, first])).toEqual(['b2', 'b1']);
  });
});
