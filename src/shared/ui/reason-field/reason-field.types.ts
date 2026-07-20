export interface ReasonFieldProps {
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly validationMessage: string | null;
  readonly testId: string;
  readonly onChange: (value: string) => void;
}
