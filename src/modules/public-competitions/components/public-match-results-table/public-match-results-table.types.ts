import type {
  PublicMatchesLabels,
  PublicMatchRowView,
} from '../../types/public-competitions-view.types';

export interface PublicMatchResultsTableProps {
  readonly labels: PublicMatchesLabels;
  readonly rows: readonly PublicMatchRowView[];
  readonly expandedKey: string | null;
  readonly onToggle: (key: string) => void;
}
