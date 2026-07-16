export interface FormFieldBinding {
  readonly name: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly errorMessage: string | undefined;
}
