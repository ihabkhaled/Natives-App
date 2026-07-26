import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { ReportStatusChipProps } from './report-status-chip.types';

/**
 * One job-status pill. A running job pulses gently (reduced-motion safe via
 * CSS); the state itself is always carried by the text, never colour or
 * motion alone.
 */
export function ReportStatusChip(props: ReportStatusChipProps): React.JSX.Element {
  return (
    <span
      className={props.isAnimated ? 'app-report-chip app-report-chip--live' : 'app-report-chip'}
    >
      <StatusChip testId={TEST_IDS.reportStatusChip} label={props.label} tone={props.tone} />
    </span>
  );
}
