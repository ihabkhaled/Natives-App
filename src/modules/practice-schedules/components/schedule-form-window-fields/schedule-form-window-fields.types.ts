import type { ScheduleFormFieldsView } from '../../types/practice-schedules-view.types';

/** The fields that decide the generation window and what a session inherits. */
export type ScheduleFormWindowFieldsProps = Pick<
  ScheduleFormFieldsView,
  | 'generationStartField'
  | 'generationStartLabel'
  | 'generationUntilField'
  | 'generationUntilLabel'
  | 'visibilityLabel'
  | 'visibilityValue'
  | 'visibilityOptions'
  | 'onVisibilityChange'
  | 'capacityField'
  | 'capacityLabel'
  | 'notesField'
  | 'notesLabel'
>;
