import { act } from '@testing-library/react';
import type { SyntheticEvent } from 'react';

import { buildSubmitEvent, flushAsyncWork } from './form-test.helper';

interface TypablePasswordForm {
  readonly password: { readonly onChange: (value: string) => void };
  readonly confirmPassword: { readonly onChange: (value: string) => void };
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Type the same value into a set-password form's fields and submit it. */
export async function submitSetPasswordForm(
  form: TypablePasswordForm,
  password: string,
): Promise<void> {
  act(() => {
    form.password.onChange(password);
  });
  act(() => {
    form.confirmPassword.onChange(password);
  });
  await act(async () => {
    form.onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}
