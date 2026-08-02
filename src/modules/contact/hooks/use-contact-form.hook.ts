import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import type { ContactFieldName } from '../contact.constants';
import { withRejectedFieldError } from '../helpers/contact-form-bindings.helper';
import { contactFormSchema } from '../schemas/contact-form.schema';
import type { ContactRequestDto } from '../types/contact.types';

export interface ContactFormView {
  readonly email: FormFieldBinding;
  readonly subject: FormFieldBinding;
  readonly message: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  /** Clear every field back to empty — used once a message is confirmed sent. */
  readonly reset: () => void;
}

interface UseContactFormOptions {
  readonly translate: (message: string) => string;
  readonly onValidSubmit: (values: ContactRequestDto) => void;
  /** Fields the backend itself rejected on its last 400, if any. */
  readonly rejectedFields: readonly ContactFieldName[];
  /** Translated copy shown under each rejected field. */
  readonly rejectedFieldMessage: string;
}

/** Schema-validated contact form: email, subject, message. */
export function useContactForm(options: UseContactFormOptions): ContactFormView {
  const form = useAppForm<ContactRequestDto>({
    schema: contactFormSchema,
    defaultValues: { email: '', subject: '', message: '' },
  });
  const email = useAppFormField({ control: form.control, name: 'email' });
  const subject = useAppFormField({ control: form.control, name: 'subject' });
  const message = useAppFormField({ control: form.control, name: 'message' });
  const decorate = (binding: FormFieldBinding, name: ContactFieldName): FormFieldBinding =>
    withRejectedFieldError(
      translateFieldError(binding, options.translate),
      name,
      options.rejectedFields,
      options.rejectedFieldMessage,
    );
  return {
    email: decorate(email, 'email'),
    subject: decorate(subject, 'subject'),
    message: decorate(message, 'message'),
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
    reset: form.reset,
  };
}
