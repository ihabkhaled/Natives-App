import { useState } from 'react';

import { useAppForm, useAppFormField, type FormFieldBinding } from '@/packages/forms';
import type { TranslateParams } from '@/packages/i18n';

import { workbenchFormSchema } from '../schemas/workbench-form.schema';
import type { WorkbenchFormValues } from '../types/workbench.types';

export interface WorkbenchFormView {
  readonly name: FormFieldBinding;
  readonly email: FormFieldBinding;
  readonly submittedName: string | undefined;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface UseWorkbenchFormOptions {
  readonly translate: (key: string, params?: TranslateParams) => string;
}

function withTranslatedError(
  binding: FormFieldBinding,
  translate: UseWorkbenchFormOptions['translate'],
): FormFieldBinding {
  return {
    ...binding,
    errorMessage:
      binding.errorMessage === undefined ? undefined : translate(binding.errorMessage),
  };
}

/** Reference form demonstrating the schema-first validation pattern. */
export function useWorkbenchForm(options: UseWorkbenchFormOptions): WorkbenchFormView {
  const form = useAppForm<WorkbenchFormValues>({
    schema: workbenchFormSchema,
    defaultValues: { name: '', email: '' },
  });
  const name = useAppFormField({ control: form.control, name: 'name' });
  const email = useAppFormField({ control: form.control, name: 'email' });
  const [submittedName, setSubmittedName] = useState<string | undefined>(undefined);
  return {
    name: withTranslatedError(name, options.translate),
    email: withTranslatedError(email, options.translate),
    submittedName,
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        setSubmittedName(values.name);
      })(event);
    },
  };
}
