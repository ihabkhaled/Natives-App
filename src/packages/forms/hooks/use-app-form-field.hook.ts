import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import type { FormFieldBinding } from '../forms.types';

export interface UseAppFormFieldOptions<TFieldValues extends FieldValues> {
  readonly control: Control<TFieldValues>;
  readonly name: FieldPath<TFieldValues>;
}

/**
 * Bind one schema-validated form field to a presentational input.
 * Returns plain props so components stay hook-free.
 */
export function useAppFormField<TFieldValues extends FieldValues>(
  options: UseAppFormFieldOptions<TFieldValues>,
): FormFieldBinding {
  const { field, fieldState } = useController({ control: options.control, name: options.name });
  return {
    name: field.name,
    value: typeof field.value === 'string' ? field.value : '',
    onChange: (value: string) => {
      field.onChange(value);
    },
    onBlur: () => {
      field.onBlur();
    },
    errorMessage: fieldState.error?.message,
  };
}
