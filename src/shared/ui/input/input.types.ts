export type AppInputType = 'text' | 'email' | 'password' | 'number';

type AppInputAutocomplete = 'email' | 'current-password' | 'name' | 'off' | 'username';

export interface AppInputProps {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onBlur?: (() => void) | undefined;
  readonly type?: AppInputType;
  readonly placeholder?: string | undefined;
  readonly errorMessage?: string | undefined;
  readonly autocomplete?: AppInputAutocomplete;
  readonly disabled?: boolean | undefined;
  readonly testId?: string | undefined;
}
