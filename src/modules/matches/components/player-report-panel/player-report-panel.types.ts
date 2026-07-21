import type { PlayerReportView } from '../../types/matches-view.types';

export interface PlayerReportPanelProps {
  readonly heading: string;
  readonly intro: string;
  readonly report: PlayerReportView | null;
  readonly onClose: () => void;
}
