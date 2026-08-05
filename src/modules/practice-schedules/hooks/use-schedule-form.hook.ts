import { useEffect } from 'react';

import { useAppForm, useAppFormField } from '@/packages/forms';

import type { ScheduleFormBindings } from '../helpers/schedule-detail-view.helper';
import { scheduleFormSchema } from '../schemas/practice-schedule-form.schema';
import type { ScheduleFormValues } from '../types/practice-schedules-view.types';

export interface UseScheduleFormOptions {
  /** Memoized by the screen hook, so switching records reloads the form once. */
  readonly values: ScheduleFormValues;
  readonly onValidSubmit: (values: ScheduleFormValues) => void;
}

/** Schema-validated schedule form: every field is a string binding. */
export function useScheduleForm(options: UseScheduleFormOptions): ScheduleFormBindings {
  const form = useAppForm<ScheduleFormValues>({
    schema: scheduleFormSchema,
    defaultValues: options.values,
  });
  const { reset } = form;
  const { values } = options;
  useEffect(() => {
    reset(values);
  }, [reset, values]);

  return {
    nameField: useAppFormField({ control: form.control, name: 'name' }),
    sessionTypeField: useAppFormField({ control: form.control, name: 'sessionType' }),
    frequencyField: useAppFormField({ control: form.control, name: 'frequency' }),
    intervalWeeksField: useAppFormField({ control: form.control, name: 'intervalWeeks' }),
    startTimeField: useAppFormField({ control: form.control, name: 'startTimeLocal' }),
    durationField: useAppFormField({ control: form.control, name: 'durationMinutes' }),
    timezoneField: useAppFormField({ control: form.control, name: 'timezone' }),
    generationStartField: useAppFormField({ control: form.control, name: 'generationStart' }),
    generationUntilField: useAppFormField({ control: form.control, name: 'generationUntil' }),
    visibilityField: useAppFormField({ control: form.control, name: 'visibility' }),
    capacityField: useAppFormField({ control: form.control, name: 'defaultCapacity' }),
    notesField: useAppFormField({ control: form.control, name: 'notes' }),
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
