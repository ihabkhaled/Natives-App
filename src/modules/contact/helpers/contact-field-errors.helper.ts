import { APP_ERROR_CODE, type AppError } from '@/shared/errors';

import { CONTACT_FIELD_NAMES, type ContactFieldName } from '../contact.constants';

function isContactField(field: string): field is ContactFieldName {
  return (CONTACT_FIELD_NAMES as readonly string[]).includes(field);
}

/**
 * The form fields the backend itself rejected on a 400. Only fields the form
 * actually renders are returned: a server complaint about a property the
 * visitor cannot see (an unknown extra key, say) belongs in the general
 * notice, not pinned to an input they never touched.
 */
export function resolveRejectedContactFields(error: AppError | null): readonly ContactFieldName[] {
  if (error?.code !== APP_ERROR_CODE.Validation) {
    return [];
  }
  return error.fieldErrors
    .map((fieldError) => fieldError.field)
    .filter((field) => isContactField(field));
}
