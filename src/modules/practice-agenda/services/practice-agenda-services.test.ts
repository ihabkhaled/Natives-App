import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/practice-agenda.gateway';
import { getPracticeAgenda } from './get-practice-agenda.service';
import { removeAgendaStation } from './remove-agenda-station.service';
import { reorderAgendaBlocks } from './reorder-agenda-blocks.service';

vi.mock('../gateways/practice-agenda.gateway', () => ({
  requestPracticeAgenda: vi.fn().mockResolvedValue({ blocks: [] }),
  requestBlockReorder: vi.fn().mockResolvedValue({}),
  requestStationRemoval: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('practice-agenda services', () => {
  it('reads one session plan', async () => {
    await getPracticeAgenda({ teamId: 't1', sessionId: 's1' });

    expect(gateway.requestPracticeAgenda).toHaveBeenCalledWith({ teamId: 't1', sessionId: 's1' });
  });

  it('carries the reorder command through unchanged', async () => {
    const command = {
      teamId: 't1',
      sessionId: 's1',
      blockIds: ['b1', 'b2'],
      expectedVersion: 2,
    };

    await reorderAgendaBlocks(command);

    expect(gateway.requestBlockReorder).toHaveBeenCalledWith(command);
  });

  it('removes one station', async () => {
    await removeAgendaStation({ teamId: 't1', sessionId: 's1', blockId: 'b1', stationId: 'st1' });

    expect(gateway.requestStationRemoval).toHaveBeenCalledOnce();
  });
});
