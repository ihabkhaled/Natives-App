import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { buildAgendaBlock } from '../../../../tests/factories/practice-agenda-view.factory';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { reorderAgendaBlocks } from '../services/reorder-agenda-blocks.service';
import type { AgendaBlock } from '../types/practice-agenda.types';
import { useAgendaBlockOrder, type AgendaBlockOrderView } from './use-agenda-block-order.hook';

vi.mock('../services/reorder-agenda-blocks.service', () => ({ reorderAgendaBlocks: vi.fn() }));

const SCOPE = { teamId: 't1', sessionId: 's1' };
const BLOCKS: readonly AgendaBlock[] = [
  buildAgendaBlock({ id: 'b3', position: 3 }),
  buildAgendaBlock({ id: 'b1', position: 1 }),
  buildAgendaBlock({ id: 'b2', position: 2 }),
];

let onSaved: Mock<() => void>;
let onFailed: Mock<() => void>;
let plan: { blocks: readonly AgendaBlock[]; version: number | null };

function renderOrder(): ReturnType<typeof renderHookWithProviders<AgendaBlockOrderView>> {
  return renderHookWithProviders(() =>
    useAgendaBlockOrder({ scope: SCOPE, ...plan, onSaved, onFailed }),
  );
}

function idsOf(view: AgendaBlockOrderView): readonly string[] {
  return view.blocks.map((block) => block.id);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(reorderAgendaBlocks).mockResolvedValue({} as never);
  onSaved = vi.fn();
  onFailed = vi.fn();
  plan = { blocks: BLOCKS, version: 4 };
});

describe('useAgendaBlockOrder', () => {
  it('draws the server order, taking position as the field of record', () => {
    const { result } = renderOrder();

    expect(idsOf(result.current)).toEqual(['b1', 'b2', 'b3']);
  });

  it('redraws a move at once, without waiting for the round trip', () => {
    const { result } = renderOrder();

    act(() => {
      result.current.move(1, -1);
    });

    // A coach adjusting a session that is already running cannot wait for the
    // server to tell them what they just did.
    expect(idsOf(result.current)).toEqual(['b2', 'b1', 'b3']);
  });

  it('posts the whole order with the version it was drawn against', async () => {
    const { result } = renderOrder();

    act(() => {
      result.current.move(2, -1);
    });

    await waitFor(() => {
      expect(reorderAgendaBlocks).toHaveBeenCalledWith({
        teamId: 't1',
        sessionId: 's1',
        blockIds: ['b1', 'b3', 'b2'],
        expectedVersion: 4,
      });
    });
  });

  it('spends nothing on a move that runs off the end of the plan', () => {
    const { result } = renderOrder();

    act(() => {
      result.current.move(0, -1);
    });

    expect(reorderAgendaBlocks).not.toHaveBeenCalled();
    expect(idsOf(result.current)).toEqual(['b1', 'b2', 'b3']);
  });

  it('gives the provisional order up once the server reports the new version', async () => {
    const { result, rerender } = renderOrder();

    act(() => {
      result.current.move(1, -1);
    });
    expect(idsOf(result.current)).toEqual(['b2', 'b1', 'b3']);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
    });

    // The refetched plan carries the version the reorder produced, so the
    // server's answer — not the coach's guess — is what stays on screen.
    plan = {
      blocks: [
        buildAgendaBlock({ id: 'b2', position: 1 }),
        buildAgendaBlock({ id: 'b1', position: 2 }),
        buildAgendaBlock({ id: 'b3', position: 3 }),
      ],
      version: 5,
    };
    rerender();

    expect(idsOf(result.current)).toEqual(['b2', 'b1', 'b3']);
  });

  it('rolls a refused move back to the order that actually holds', async () => {
    vi.mocked(reorderAgendaBlocks).mockRejectedValue(new Error('conflict'));
    const { result } = renderOrder();

    act(() => {
      result.current.move(1, -1);
    });
    expect(idsOf(result.current)).toEqual(['b2', 'b1', 'b3']);

    await waitFor(() => {
      expect(onFailed).toHaveBeenCalled();
    });
    expect(idsOf(result.current)).toEqual(['b1', 'b2', 'b3']);
  });

  it('reports while the move is in flight, so the arrows can go quiet', async () => {
    vi.mocked(reorderAgendaBlocks).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderOrder();

    act(() => {
      result.current.move(1, -1);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });
  });

  it('guards with no version at all while the agenda is still versionless', async () => {
    plan = { blocks: BLOCKS, version: null };
    const { result } = renderOrder();

    act(() => {
      result.current.move(1, -1);
    });

    await waitFor(() => {
      expect(reorderAgendaBlocks).toHaveBeenCalledWith(
        expect.objectContaining({ expectedVersion: null }),
      );
    });
    expect(idsOf(result.current)).toEqual(['b2', 'b1', 'b3']);
  });
});
