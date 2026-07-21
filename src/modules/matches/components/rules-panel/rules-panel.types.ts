import type { FactListItem } from '@/shared/ui';

export interface RulesPanelProps {
  readonly heading: string;
  readonly intro: string;
  readonly rules: readonly FactListItem[];
}
