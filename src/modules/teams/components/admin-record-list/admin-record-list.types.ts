import type { AdminRecordRowView } from '../../types/teams-view.types';

export interface AdminRecordListProps {
  readonly rows: readonly AdminRecordRowView[];
  readonly ariaLabel: string;
  readonly rowTestId: string;
}
