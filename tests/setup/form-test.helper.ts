import type { SyntheticEvent } from 'react';

/** The submit event shape react-hook-form's handleSubmit touches. */
export function buildSubmitEvent(): SyntheticEvent<HTMLFormElement> {
  return {
    preventDefault: () => undefined,
    persist: () => undefined,
  } as unknown as SyntheticEvent<HTMLFormElement>;
}

/** Let a form's async schema resolver settle inside the act() window. */
export function flushAsyncWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
