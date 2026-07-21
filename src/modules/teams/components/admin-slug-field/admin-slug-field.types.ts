import type { AdminFieldView } from '../../types/teams-view.types';

export interface AdminSlugFieldProps {
  readonly field: AdminFieldView;
  readonly name: string;
  readonly testId: string;
}
