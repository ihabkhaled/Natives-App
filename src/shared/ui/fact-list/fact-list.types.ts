export interface FactListItem {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface FactListProps {
  readonly items: readonly FactListItem[];
  readonly ariaLabel: string;
  readonly testId?: string;
}
