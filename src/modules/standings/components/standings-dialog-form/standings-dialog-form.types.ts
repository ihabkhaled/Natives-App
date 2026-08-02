export interface StandingsDialogFormProps {
  /** Identifies the concrete form (achievement, manual standing, rule version). */
  readonly testId: string;
  /** Doubles as the form's accessible name and its visible title. */
  readonly heading: string;
  readonly onSubmit: () => void;
  readonly children: React.ReactNode;
}
