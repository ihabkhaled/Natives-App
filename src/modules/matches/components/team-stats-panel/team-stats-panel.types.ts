import type { FactListItem } from '@/shared/ui';

export interface TeamStatsPanelProps {
  readonly heading: string;
  readonly intro: string;
  readonly facts: readonly FactListItem[];
}
