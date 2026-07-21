import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList, SectionPanel } from '@/shared/ui';

import type { PlayerReportPanelProps } from './player-report-panel.types';

/**
 * One player's match report. A rostered player with an all-zero line still
 * gets a report, and it says so in words instead of looking like a failure.
 *
 * With nothing selected the panel is only its own instruction: repeating that
 * sentence inside an empty state would say the same thing twice.
 */
export function PlayerReportPanel(props: PlayerReportPanelProps): React.JSX.Element {
  const { report } = props;
  return (
    <SectionPanel heading={props.heading} intro={props.intro} testId={TEST_IDS.matchStatsReport}>
      {report === null ? null : (
        <>
          <h3 className="app-match-stats__report-title">{report.heading}</h3>
          {report.zeroNotice === null ? null : <IonNote>{report.zeroNotice}</IonNote>}
          {report.missingNotice === null ? null : <IonNote>{report.missingNotice}</IonNote>}
          <FactList items={report.facts} ariaLabel={report.heading} />
          <AppButton label={report.closeLabel} tone="ghost" onClick={props.onClose} />
        </>
      )}
    </SectionPanel>
  );
}
