import { useEffect } from 'react';

import { useAppForm, useAppFormField, type FormFieldBinding } from '@/packages/forms';

import { drillFormSchema } from '../schemas/drill-form.schema';
import type { DrillFormValues } from '../types/drills.types';

export interface DrillFormBindings {
  readonly nameField: FormFieldBinding;
  readonly categoryField: FormFieldBinding;
  readonly intensityField: FormFieldBinding;
  readonly objectiveField: FormFieldBinding;
  readonly instructionsField: FormFieldBinding;
  readonly equipmentField: FormFieldBinding;
  readonly skillTagsField: FormFieldBinding;
  readonly durationField: FormFieldBinding;
  readonly safetyNotesField: FormFieldBinding;
  readonly mediaUrlField: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
}

export interface UseDrillFormOptions {
  /** Memoized by the screen hook, so switching drills reloads the form once. */
  readonly values: DrillFormValues;
  readonly onValidSubmit: (values: DrillFormValues) => void;
}

/** Schema-validated drill form: the ten fields a coach can write. */
export function useDrillForm(options: UseDrillFormOptions): DrillFormBindings {
  const form = useAppForm<DrillFormValues>({
    schema: drillFormSchema,
    defaultValues: options.values,
  });
  const { reset } = form;
  const values = options.values;
  useEffect(() => {
    reset(values);
  }, [reset, values]);

  return {
    nameField: useAppFormField({ control: form.control, name: 'name' }),
    categoryField: useAppFormField({ control: form.control, name: 'category' }),
    intensityField: useAppFormField({ control: form.control, name: 'intensity' }),
    objectiveField: useAppFormField({ control: form.control, name: 'objective' }),
    instructionsField: useAppFormField({ control: form.control, name: 'instructions' }),
    equipmentField: useAppFormField({ control: form.control, name: 'equipment' }),
    skillTagsField: useAppFormField({ control: form.control, name: 'skillTags' }),
    durationField: useAppFormField({ control: form.control, name: 'defaultDurationMinutes' }),
    safetyNotesField: useAppFormField({ control: form.control, name: 'safetyNotes' }),
    mediaUrlField: useAppFormField({ control: form.control, name: 'mediaUrl' }),
    onSubmit: (event) => {
      void form.handleSubmit((submitted) => {
        options.onValidSubmit(submitted);
      })(event);
    },
    onReset: () => {
      reset(values);
    },
  };
}
