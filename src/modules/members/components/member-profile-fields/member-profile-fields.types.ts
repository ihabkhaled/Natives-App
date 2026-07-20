import type { ProfileFieldView } from '../../types/members-view.types';

export interface MemberProfileFieldsProps {
  readonly heading: string;
  readonly restrictedNotice: string | null;
  readonly fields: readonly ProfileFieldView[];
}
