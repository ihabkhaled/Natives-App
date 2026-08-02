import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { translateNow } from '@/packages/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import type { ContactFieldName } from '../contact.constants';
import { useContactForm, type ContactFormView } from './use-contact-form.hook';

function renderContactForm(
  onValidSubmit = vi.fn(),
  rejectedFields: readonly ContactFieldName[] = [],
): {
  readonly current: () => ContactFormView;
  readonly onValidSubmit: typeof onValidSubmit;
} {
  const { result } = renderHook(() =>
    useContactForm({
      translate: translateNow,
      onValidSubmit,
      rejectedFields,
      rejectedFieldMessage: 'Our server did not accept this value.',
    }),
  );
  return { current: () => result.current, onValidSubmit };
}

async function submitForm(view: { readonly current: () => ContactFormView }): Promise<void> {
  await act(async () => {
    view.current().onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

async function fillValidForm(view: { readonly current: () => ContactFormView }): Promise<void> {
  act(() => {
    view.current().email.onChange('player@example.com');
  });
  act(() => {
    view.current().subject.onChange('Tryout question');
  });
  act(() => {
    view.current().message.onChange('I would like to know more about your next tryout.');
  });
  await submitForm(view);
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useContactForm', () => {
  it('starts with empty, error-free fields bound to their names', () => {
    const view = renderContactForm();

    expect(view.current().email.value).toBe('');
    expect(view.current().email.name).toBe('email');
    expect(view.current().subject.value).toBe('');
    expect(view.current().message.value).toBe('');
    expect(view.current().email.errorMessage).toBeUndefined();
    expect(view.current().subject.errorMessage).toBeUndefined();
    expect(view.current().message.errorMessage).toBeUndefined();
  });

  it('translates every validation error on an empty submit', async () => {
    const view = renderContactForm();

    await submitForm(view);

    expect(view.current().email.errorMessage).toBe('Enter your email address.');
    expect(view.current().subject.errorMessage).toBe('Subject must be at least 3 characters.');
    expect(view.current().message.errorMessage).toBe('Message must be at least 10 characters.');
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('translates the malformed-email error', async () => {
    const view = renderContactForm();

    act(() => {
      view.current().email.onChange('not-an-email');
    });
    await submitForm(view);

    expect(view.current().email.errorMessage).toBe('Enter a valid email address.');
  });

  it('reports the trimmed values when the whole form is valid', async () => {
    const view = renderContactForm();

    await fillValidForm(view);

    expect(view.onValidSubmit).toHaveBeenCalledExactlyOnceWith({
      email: 'player@example.com',
      subject: 'Tryout question',
      message: 'I would like to know more about your next tryout.',
    });
  });

  it('marks the fields the backend itself rejected', () => {
    const view = renderContactForm(vi.fn(), ['subject']);

    expect(view.current().subject.errorMessage).toBe('Our server did not accept this value.');
    expect(view.current().email.errorMessage).toBeUndefined();
  });

  it('clears every field back to empty on reset', async () => {
    const view = renderContactForm();
    await fillValidForm(view);

    act(() => {
      view.current().reset();
    });

    expect(view.current().email.value).toBe('');
    expect(view.current().subject.value).toBe('');
    expect(view.current().message.value).toBe('');
  });
});
