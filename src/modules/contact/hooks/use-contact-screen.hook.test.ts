import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useContactScreen } from './use-contact-screen.hook';

beforeAll(async () => {
  await initTestI18n();
});

describe('useContactScreen', () => {
  it('resolves the canonical contact path for SEO metadata', () => {
    const { result } = renderHook(() => useContactScreen());

    expect(result.current.path).toBe('/contact');
  });

  it('titles the document with the page and product name', () => {
    const { result } = renderHook(() => useContactScreen());

    expect(result.current.seoTitle).toBe('Contact Us — Ultimate Natives');
  });

  it('keeps the form disabled until the real endpoint ships', () => {
    const { result } = renderHook(() => useContactScreen());

    expect(result.current.isFormEnabled).toBe(false);
    expect(result.current.unavailableTitle.length).toBeGreaterThan(0);
    expect(result.current.unavailableMessage.length).toBeGreaterThan(0);
  });

  it('calls the stub seam on a valid submit and settles back to idle', async () => {
    const { result } = renderHook(() => useContactScreen());

    act(() => {
      result.current.form.email.onChange('player@example.com');
    });
    act(() => {
      result.current.form.subject.onChange('Tryout question');
    });
    act(() => {
      result.current.form.message.onChange('I would like to know more, thanks!');
    });
    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('lists the three real social profiles with a readable label', () => {
    const { result } = renderHook(() => useContactScreen());

    expect(result.current.socialLinks).toEqual([
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
