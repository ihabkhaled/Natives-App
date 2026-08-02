import type { FormFieldBinding } from '@/packages/forms';

import type { ContactFieldName } from '../contact.constants';

/**
 * Pin a server-side rejection to the input it names. A client-side schema
 * error always wins: it is the more specific complaint, and it is the one the
 * visitor can fix without another round trip.
 */
export function withRejectedFieldError(
  binding: FormFieldBinding,
  name: ContactFieldName,
  rejected: readonly ContactFieldName[],
  message: string,
): FormFieldBinding {
  return binding.errorMessage === undefined && rejected.includes(name)
    ? { ...binding, errorMessage: message }
    : binding;
}
