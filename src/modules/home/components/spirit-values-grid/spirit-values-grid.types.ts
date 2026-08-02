export interface SpiritValueItem {
  readonly key: string;
  readonly title: string;
  readonly body: string;
}

export interface SpiritValuesGridProps {
  readonly heading: string;
  readonly intro: string;
  readonly values: readonly SpiritValueItem[];
  readonly cardTestIdPrefix: string;
  readonly sectionTestId?: string;
}
