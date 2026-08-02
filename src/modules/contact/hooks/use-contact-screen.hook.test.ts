import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { submitContactRequest } from '../services/submit-contact.service';
import { useContactScreen, type ContactScreenView } from './use-contact-screen.hook';

vi.mock('../services/submit-contact.service', () => ({
  submitContactRequest: vi.fn(),
}));

const VALID_MESSAGE = 'I would like to know more, thanks!';

function renderScreen(): { readonly current: () => ContactScreenView } {
  const { result } = renderHookWithProviders(() => useContactScreen());
  return { current: () => result.current };
}

async function fillAndSubmit(view: { readonly current: () => ContactScreenView }): Promise<void> {
  act(() => {
    view.current().form.email.onChange('player@example.com');
  });
  act(() => {
    view.current().form.subject.onChange('Tryout question');
  });
  act(() => {
    view.current().form.message.onChange(VALID_MESSAGE);
  });
  await act(async () => {
    view.current().form.onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useContactScreen', () => {
  it('resolves the canonical contact path for SEO metadata', () => {
    expect(renderScreen().current().path).toBe('/contact');
  });

  it('titles the document with the page and product name', () => {
    expect(renderScreen().current().seoTitle).toBe('Contact Us — Ultimate Natives');
  });

  it('enables the form now that the relay is live, and starts with no notice', () => {
    const view = renderScreen();

    expect(view.current().isFormEnabled).toBe(true);
    expect(view.current().notice).toBeNull();
  });

  it('sends a valid message to the relay', async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ sent: true });
    const view = renderScreen();

    await fillAndSubmit(view);

    expect(submitContactRequest).toHaveBeenCalledExactlyOnceWith({
      email: 'player@example.com',
      subject: 'Tryout question',
      message: VALID_MESSAGE,
    });
  });

  it('confirms a sent message and clears the form', async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ sent: true });
    const view = renderScreen();

    await fillAndSubmit(view);

    await waitFor(() => {
      expect(view.current().notice?.tone).toBe('success');
    });
    expect(view.current().notice?.title).toBe('Message sent');
    expect(view.current().form.email.value).toBe('');
    expect(view.current().form.message.value).toBe('');
  });

  it('keeps what the visitor wrote when the send fails, and offers a retry', async () => {
    vi.mocked(submitContactRequest).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );
    const view = renderScreen();

    await fillAndSubmit(view);

    await waitFor(() => {
      expect(view.current().notice?.tone).toBe('error');
    });
    expect(view.current().form.message.value).toBe(VALID_MESSAGE);
    expect(view.current().notice?.retry).not.toBeNull();
  });

  it('marks the fields the backend rejected on a 400', async () => {
    vi.mocked(submitContactRequest).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Validation,
        fieldErrors: [{ field: 'subject', code: 'LENGTH_OUT_OF_RANGE' }],
      }),
    );
    const view = renderScreen();

    await fillAndSubmit(view);

    await waitFor(() => {
      expect(view.current().form.subject.errorMessage).toBe(
        'Our server did not accept this value.',
      );
    });
  });

  it('never sends a message the schema already rejects', async () => {
    const view = renderScreen();

    await act(async () => {
      view.current().form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(submitContactRequest).not.toHaveBeenCalled();
    expect(view.current().isSubmitting).toBe(false);
  });

  it('lists the three real social profiles with a readable label', () => {
    expect(renderScreen().current().socialLinks).toEqual([
      {
        key: 'facebook',
        href: 'https://www.facebook.com/ultimatenatives',
        label: 'www.facebook.com/ultimatenatives',
      },
      {
        key: 'instagram',
        href: 'https://www.instagram.com/ultimatenatives',
        label: 'www.instagram.com/ultimatenatives',
      },
      {
        key: 'tiktok',
        href: 'https://www.tiktok.com/@ultimate.natives',
        label: 'www.tiktok.com/@ultimate.natives',
      },
    ]);
  });
});
