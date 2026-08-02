import { act, waitFor, type RenderHookResult } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import {
  actOnHook,
  renderHookWithProviders,
} from '../../../../tests/setup/render-with-providers.helper';
import { submitContactRequest } from '../services/submit-contact.service';
import type { ContactRequestDto } from '../types/contact.types';
import {
  useSubmitContactMutation,
  type SubmitContactMutationView,
} from './use-submit-contact-mutation.hook';

vi.mock('../services/submit-contact.service', () => ({
  submitContactRequest: vi.fn(),
}));

type MutationRender = RenderHookResult<SubmitContactMutationView, unknown>;

const REQUEST: ContactRequestDto = {
  email: 'visitor@example.test',
  subject: 'Tryout question',
  message: 'I would like to know more about your next open tryout.',
};

/** Render the mutation and send one message through it. */
function renderAndSubmit(): MutationRender {
  return actOnHook(
    () => useSubmitContactMutation(),
    (api) => {
      api.submit(REQUEST);
    },
  );
}

async function waitForFailure(view: MutationRender): Promise<void> {
  await waitFor(() => {
    expect(view.result.current.error).not.toBeNull();
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSubmitContactMutation', () => {
  it('starts idle, unsent, with no error', () => {
    const { result } = renderHookWithProviders(() => useSubmitContactMutation());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSent).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sends the message and confirms it', async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ sent: true });

    const { result } = renderAndSubmit();

    await waitFor(() => {
      expect(result.current.isSent).toBe(true);
    });
    expect(submitContactRequest).toHaveBeenCalledExactlyOnceWith(REQUEST);
  });

  it('surfaces a failure as an AppError and never claims the message was sent', async () => {
    vi.mocked(submitContactRequest).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.RateLimited }),
    );

    const view = renderAndSubmit();
    await waitForFailure(view);

    expect(view.result.current.error?.code).toBe(APP_ERROR_CODE.RateLimited);
    expect(view.result.current.isSent).toBe(false);
  });

  it('resends exactly what the visitor wrote when a failure is retried', async () => {
    vi.mocked(submitContactRequest).mockRejectedValueOnce(
      new AppError({ code: APP_ERROR_CODE.NetworkOffline }),
    );
    vi.mocked(submitContactRequest).mockResolvedValueOnce({ sent: true });

    const view = renderAndSubmit();
    await waitForFailure(view);
    act(() => {
      view.result.current.retry();
    });

    await waitFor(() => {
      expect(view.result.current.isSent).toBe(true);
    });
    expect(submitContactRequest).toHaveBeenNthCalledWith(2, REQUEST);
  });

  it('does nothing when retried before anything was ever submitted', () => {
    const { result } = renderHookWithProviders(() => useSubmitContactMutation());
    act(() => {
      result.current.retry();
    });

    expect(submitContactRequest).not.toHaveBeenCalled();
  });
});
