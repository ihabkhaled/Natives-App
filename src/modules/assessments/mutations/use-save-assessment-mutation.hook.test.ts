import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { saveAssessmentValues } from '../services/save-assessment-values.service';
import { useSaveAssessmentMutation } from './use-save-assessment-mutation.hook';

vi.mock('../services/save-assessment-values.service', () => ({
  saveAssessmentValues: vi.fn(),
}));

const onSuccess = vi.fn();
const onConflict = vi.fn();
const onError = vi.fn();

const INPUT = { summary: null, values: [], expectedRecordVersion: 2 };

function renderSave() {
  return actOnHook(
    () => useSaveAssessmentMutation('t', 'a', { onSuccess, onConflict, onError }),
    (api) => {
      api.save(INPUT);
    },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSaveAssessmentMutation', () => {
  it('sends the draft and announces success', async () => {
    vi.mocked(saveAssessmentValues).mockResolvedValue({
      assessment: { id: 'a' },
      values: [],
    } as never);

    const { result } = renderSave();

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(saveAssessmentValues).toHaveBeenCalledExactlyOnceWith('t', 'a', INPUT);
    expect(result.current.isSaving).toBe(false);
  });

  it('routes a stale record version to the conflict callback', async () => {
    vi.mocked(saveAssessmentValues).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Conflict }),
    );

    renderSave();

    await vi.waitFor(() => {
      expect(onConflict).toHaveBeenCalledOnce();
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes any other failure to the generic error callback', async () => {
    vi.mocked(saveAssessmentValues).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );

    renderSave();

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });
    expect(onConflict).not.toHaveBeenCalled();
  });
});
