import type { ReactNode } from 'react';

export interface FormFieldProps {
  readonly label: string;
  readonly htmlFor: string;
  readonly children: ReactNode;
  readonly errorMessage?: string | undefined;
  readonly hint?: string;
  readonly testId?: string;
}
