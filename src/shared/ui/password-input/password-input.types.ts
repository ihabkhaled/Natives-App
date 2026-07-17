export interface AppPasswordInputProps {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onBlur?: (() => void) | undefined;
  readonly placeholder?: string | undefined;
  readonly errorMessage?: string | undefined;
  readonly revealed: boolean;
  readonly onToggleReveal: () => void;
  readonly revealLabel: string;
  readonly hideLabel: string;
  readonly testId?: string | undefined;
}
