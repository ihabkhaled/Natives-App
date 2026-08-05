import type { ScheduleFormFieldsView } from '../../types/practice-schedules-view.types';

/** The fields that define the pattern itself: what, when, and how often. */
export type ScheduleFormPatternFieldsProps = Pick<
  ScheduleFormFieldsView,
  | 'nameField'
  | 'nameLabel'
  | 'sessionTypeField'
  | 'sessionTypeLabel'
  | 'frequencyLabel'
  | 'frequencyValue'
  | 'frequencyOptions'
  | 'onFrequencyChange'
  | 'weekdaysLabel'
  | 'weekdayOptions'
  | 'onWeekdayToggle'
  | 'intervalWeeksField'
  | 'intervalWeeksLabel'
  | 'startTimeField'
  | 'startTimeLabel'
  | 'durationField'
  | 'durationLabel'
  | 'timezoneField'
  | 'timezoneLabel'
>;
