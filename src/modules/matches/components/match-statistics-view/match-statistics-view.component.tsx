import { TEST_IDS } from '@/shared/config';
import { DetailScreen, FactList, SectionPanel } from '@/shared/ui';

import { MATCH_STATS_STATE_TEST_IDS } from '../../constants/matches-view.constants';
import { PlayerReportPanel } from '../player-report-panel';
import { PlayerStatsTable } from '../player-stats-table';
import { StatsBarChart } from '../stats-bar-chart';
import { TeamStatsPanel } from '../team-stats-panel';
import { VideoGapPanel } from '../video-gap-panel';
import type { MatchStatisticsViewProps } from './match-statistics-view.types';

/**
 * Match statistics: the team line, an accessible chart, the complete player
 * table, one player's report, the glossary and derivation notes, and the
 * honestly-empty video surface.
 */
export function MatchStatisticsView(props: MatchStatisticsViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.matchStatsPage}
      viewTestId={TEST_IDS.matchStatsView}
      className="app-match-stats"
      backLabel={props.backLabel}
      backTestId={TEST_IDS.matchStatsBack}
      onBack={props.onBack}
      notice={props.incompleteNotice}
      state={{ view: props, variant: 'detail', ...MATCH_STATS_STATE_TEST_IDS }}
    >
      <div className="app-match-stats__grid">
        <TeamStatsPanel
          heading={props.teamHeading}
          intro={props.teamIntro}
          facts={props.teamFacts}
        />
        <StatsBarChart
          heading={props.chartHeading}
          caption={props.chartCaption}
          toggleLabel={props.chartToggle}
          columns={props.chartColumns}
          bars={props.chartBars}
          rows={props.chartRows}
        />
      </div>

      <PlayerStatsTable view={props} />

      <div className="app-match-stats__grid">
        <PlayerReportPanel
          heading={props.reportHeading}
          intro={props.reportIntro}
          report={props.report}
          onClose={props.onCloseReport}
        />
        <SectionPanel
          heading={props.glossaryHeading}
          intro={props.glossaryIntro}
          testId={TEST_IDS.matchStatsGlossary}
        >
          <FactList items={props.glossary} ariaLabel={props.glossaryHeading} />
        </SectionPanel>
        <SectionPanel
          heading={props.derivationHeading}
          intro={props.derivationIntro}
          testId={TEST_IDS.matchStatsDerivation}
        >
          <FactList items={props.derivation} ariaLabel={props.derivationHeading} />
        </SectionPanel>
        <VideoGapPanel view={props.video} />
      </div>
    </DetailScreen>
  );
}
