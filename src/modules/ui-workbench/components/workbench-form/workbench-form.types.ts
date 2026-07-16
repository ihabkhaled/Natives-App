import type { FormFieldBinding } from '@/packages/forms';

export interface WorkbenchFormProps {
  readonly heading: string;
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly submitLabel: string;
  readonly name: FormFieldBinding;
  readonly email: FormFieldBinding;
  readonly successMessage: string | undefined;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}
