import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRegistrationDraft } from './use-registration-draft.hook';

const RESULT = { outcome: 'registered', reference: 'UN-1', consentVersion: 'v1' } as const;

describe('useRegistrationDraft', () => {
  it('starts empty, with no result and no failure', () => {
    const { result } = renderHook(() => useRegistrationDraft());

    expect(result.current.draft.fullName).toBe('');
    expect(result.current.draft.consentGiven).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.hasFailed).toBe(false);
  });

  it('merges each edit into the draft without dropping the rest', () => {
    const { result } = renderHook(() => useRegistrationDraft());
    act(() => {
      result.current.patch({ fullName: 'Sara Nabil' });
    });
    act(() => {
      result.current.patch({ email: 'sara@example.test' });
    });

    expect(result.current.draft.fullName).toBe('Sara Nabil');
    expect(result.current.draft.email).toBe('sara@example.test');
  });

  it('records the server answer and clears any earlier failure', () => {
    const { result } = renderHook(() => useRegistrationDraft());
    act(() => {
      result.current.onFailure();
    });
    act(() => {
      result.current.onResult(RESULT);
    });

    expect(result.current.result).toEqual(RESULT);
    expect(result.current.hasFailed).toBe(false);
  });

  it('flags a failed attempt without inventing a result', () => {
    const { result } = renderHook(() => useRegistrationDraft());
    act(() => {
      result.current.onFailure();
    });

    expect(result.current.hasFailed).toBe(true);
    expect(result.current.result).toBeNull();
  });

  it('clears the failure notice as soon as the candidate edits the form', () => {
    const { result } = renderHook(() => useRegistrationDraft());
    act(() => {
      result.current.onFailure();
    });
    act(() => {
      result.current.patch({ email: 'sara@example.test' });
    });

    expect(result.current.hasFailed).toBe(false);
  });

  it('resets the whole form so a second application starts clean', () => {
    const { result } = renderHook(() => useRegistrationDraft());
    act(() => {
      result.current.patch({ fullName: 'Sara Nabil', consentGiven: true });
    });
    act(() => {
      result.current.onResult(RESULT);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.draft.fullName).toBe('');
    expect(result.current.draft.consentGiven).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.hasFailed).toBe(false);
  });
});
