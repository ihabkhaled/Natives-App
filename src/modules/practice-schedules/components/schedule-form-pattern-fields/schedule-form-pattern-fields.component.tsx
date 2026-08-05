import { TEST_IDS } from '@/shared/config';
import { AppInput, SelectField } from '@/shared/ui';

import { WeekdayPicker } from '../weekday-picker';
import type { ScheduleFormPatternFieldsProps } from './schedule-form-pattern-fields.types';

/** What the pattern is, and when it repeats. */
export function ScheduleFormPatternFields(
  props: ScheduleFormPatternFieldsProps,
): React.JSX.Element {
  return (
    <>
      <AppInput
        label={props.nameLabel}
        name={props.nameField.name}
        value={props.nameField.value}
        onValueChange={props.nameField.onChange}
        onBlur={props.nameField.onBlur}
        errorMessage={props.nameField.errorMessage}
        testId={TEST_IDS.practiceScheduleNameInput}
      />
      <AppInput
        label={props.sessionTypeLabel}
        name={props.sessionTypeField.name}
        value={props.sessionTypeField.value}
        onValueChange={props.sessionTypeField.onChange}
        onBlur={props.sessionTypeField.onBlur}
        errorMessage={props.sessionTypeField.errorMessage}
        testId={TEST_IDS.practiceScheduleSessionTypeInput}
      />
      <SelectField
        label={props.frequencyLabel}
        value={props.frequencyValue}
        options={props.frequencyOptions}
        onChange={props.onFrequencyChange}
        testId={TEST_IDS.practiceScheduleFrequencySelect}
      />
      <WeekdayPicker
        label={props.weekdaysLabel}
        options={props.weekdayOptions}
        onToggle={props.onWeekdayToggle}
        testId={TEST_IDS.practiceScheduleWeekdayToggle}
      />
      <AppInput
        label={props.intervalWeeksLabel}
        name={props.intervalWeeksField.name}
        type="number"
        value={props.intervalWeeksField.value}
        onValueChange={props.intervalWeeksField.onChange}
        onBlur={props.intervalWeeksField.onBlur}
        errorMessage={props.intervalWeeksField.errorMessage}
        testId={TEST_IDS.practiceScheduleIntervalInput}
      />
      <AppInput
        label={props.startTimeLabel}
        name={props.startTimeField.name}
        placeholder="18:00"
        value={props.startTimeField.value}
        onValueChange={props.startTimeField.onChange}
        onBlur={props.startTimeField.onBlur}
        errorMessage={props.startTimeField.errorMessage}
        testId={TEST_IDS.practiceScheduleStartTimeInput}
      />
      <AppInput
        label={props.durationLabel}
        name={props.durationField.name}
        type="number"
        value={props.durationField.value}
        onValueChange={props.durationField.onChange}
        onBlur={props.durationField.onBlur}
        errorMessage={props.durationField.errorMessage}
        testId={TEST_IDS.practiceScheduleDurationInput}
      />
      <AppInput
        label={props.timezoneLabel}
        name={props.timezoneField.name}
        placeholder="Africa/Cairo"
        value={props.timezoneField.value}
        onValueChange={props.timezoneField.onChange}
        onBlur={props.timezoneField.onBlur}
        errorMessage={props.timezoneField.errorMessage}
        testId={TEST_IDS.practiceScheduleTimezoneInput}
      />
    </>
  );
}
