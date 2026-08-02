import { useState } from 'react';

import { EMPTY_REGISTRATION_DRAFT } from '../helpers/registration-form.helper';
import type { RegistrationResult } from '../types/tryouts.types';
import type {
  RegistrationDraft,
  RegistrationDraftState,
} from '../types/public-tryouts-view.types';

/**
 * The application draft, the server's answer, and the failure flag. Editing
 * any field clears a previous failure so the notice cannot linger over a form
 * the candidate has already corrected.
 */
export function useRegistrationDraft(): RegistrationDraftState {
  const [draft, setDraft] = useState<RegistrationDraft>(EMPTY_REGISTRATION_DRAFT);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  return {
    draft,
    result,
    hasFailed,
    patch: (change: Partial<RegistrationDraft>) => {
      setDraft((current) => ({ ...current, ...change }));
      setHasFailed(false);
    },
    onResult: (next: RegistrationResult) => {
      setResult(next);
      setHasFailed(false);
    },
    onFailure: () => {
      setHasFailed(true);
    },
    reset: () => {
      setDraft(EMPTY_REGISTRATION_DRAFT);
      setResult(null);
      setHasFailed(false);
    },
  };
}
