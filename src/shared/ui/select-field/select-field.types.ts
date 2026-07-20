/** One choice in a select field: a wire value plus its translated label. */
export interface SelectFieldOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectFieldProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly SelectFieldOption[];
  readonly onChange: (value: string) => void;
  readonly placeholder?: string | undefined;
  readonly testId?: string | undefined;
}
