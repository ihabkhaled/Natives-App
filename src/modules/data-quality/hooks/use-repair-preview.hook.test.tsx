import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { previewRepair } from '../services/preview-repair.service';
import { useRepairPreview } from './use-repair-preview.hook';

vi.mock('../services/preview-repair.service', () => ({ previewRepair: vi.fn() }));

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

const onApply = vi.fn();

function render(): ReturnType<typeof renderHookWithProviders<ReturnType<typeof useRepairPreview>>> {
  return renderHookWithProviders(() => useRepairPreview(t, 't1', { isApplying: false, onApply }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(previewRepair).mockResolvedValue({
    anomalyId: 'a1',
    repairKind: 'merge_duplicate_jersey',
    impactCount: 4,
    impactSummary: 'Four roster entries would be renumbered.',
    reversible: true,
  });
});

/** Opens the preview and waits for it to resolve; returns the live result. */
async function openPreview(): Promise<ReturnType<typeof render>> {
  const view = render();

  act(() => {
    view.result.current.open('a1');
  });
  await waitFor(() => {
    expect(view.result.current.view).not.toBeNull();
  });

  return view;
}

describe('useRepairPreview', () => {
  it('asks for nothing until an operator opens a preview', () => {
    const { result } = render();

    expect(result.current.view).toBeNull();
    expect(previewRepair).not.toHaveBeenCalled();
  });

  it('reads the preview for the anomaly that was opened', async () => {
    const { result } = render();

    act(() => {
      result.current.open('a1');
    });

    await waitFor(() => {
      expect(result.current.view?.repairKind).toBe('merge_duplicate_jersey');
    });
    expect(previewRepair).toHaveBeenCalledWith({ teamId: 't1', anomalyId: 'a1' });
  });

  it('says the change can be undone when the server says it is reversible', async () => {
    const { result } = render();

    act(() => {
      result.current.open('a1');
    });

    await waitFor(() => {
      expect(result.current.view?.reversibilityLabel).toBe('t:dataQuality.previewReversible');
    });
  });

  it('says plainly when the change cannot be undone', async () => {
    vi.mocked(previewRepair).mockResolvedValue({
      anomalyId: 'a1',
      repairKind: 'purge_orphan',
      impactCount: 1,
      impactSummary: 'One profile would be removed.',
      reversible: false,
    });
    const { result } = render();

    act(() => {
      result.current.open('a1');
    });

    await waitFor(() => {
      expect(result.current.view?.reversibilityLabel).toBe('t:dataQuality.previewIrreversible');
    });
  });

  it('applies the anomaly it previewed, not whichever card was last rendered', async () => {
    const { result } = await openPreview();

    act(() => {
      result.current.view?.onApply();
    });

    expect(onApply).toHaveBeenCalledWith('a1');
  });

  it('closes the preview without changing anything', async () => {
    const { result } = await openPreview();

    act(() => {
      result.current.view?.onCancel();
    });

    await waitFor(() => {
      expect(result.current.view).toBeNull();
    });
    expect(onApply).not.toHaveBeenCalled();
  });
});
