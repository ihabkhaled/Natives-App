import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import { contactFormSchema } from '../schemas/contact-form.schema';
import type { ContactRequestDto } from '../types/contact.types';

export interface ContactFormView {
  readonly email: FormFieldBinding;
  readonly subject: FormFieldBinding;
  readonly message: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}

interface UseContactFormOptions {
  readonly translate: (message: string) => string;
  readonly onValidSubmit: (values: ContactRequestDto) => void;
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
  return {
    email: translateFieldError(email, options.translate),
    subject: translateFieldError(subject, options.translate),
    message: translateFieldError(message, options.translate),
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
  };
}
