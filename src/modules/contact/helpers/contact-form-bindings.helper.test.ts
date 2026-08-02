import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';

import { withRejectedFieldError } from './contact-form-bindings.helper';

function binding(errorMessage?: string): FormFieldBinding {
  return {
    name: 'email',
    value: 'player@example.com',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage,
  };
}

describe('withRejectedFieldError', () => {
  it('leaves an untouched field alone', () => {
    const original = binding();

    expect(withRejectedFieldError(original, 'email', [], 'rejected')).toBe(original);
  });

  it('pins the server complaint to the field it names', () => {
    const decorated = withRejectedFieldError(binding(), 'email', ['email'], 'rejected');

    expect(decorated.errorMessage).toBe('rejected');
  });

  it('leaves other fields alone when only one was rejected', () => {
    const original = binding();

    expect(withRejectedFieldError(original, 'subject', ['email'], 'rejected')).toBe(original);
  });

  it('keeps the client-side error, which is the more specific complaint', () => {
    const original = binding('Enter a valid email address.');

    expect(withRejectedFieldError(original, 'email', ['email'], 'rejected')).toBe(original);
  });
});
