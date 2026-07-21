import type { PreferenceRowView } from '../../types/notifications-view.types';

export interface PreferenceMatrixProps {
  readonly heading: string;
  readonly intro: string;
  readonly mandatoryNotice: string;
  readonly rows: readonly PreferenceRowView[];
}
