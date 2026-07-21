import { TEST_IDS } from '@/shared/config';
import { DetailScreen } from '@/shared/ui';

import { SCOREBOARD_STATE_TEST_IDS } from '../../constants/matches-view.constants';
import { FinalizePanel } from '../finalize-panel';
import { MatchStatePanel } from '../match-state-panel';
import { MatchTimelinePanel } from '../match-timeline-panel';
import { ScoreboardHead } from '../scoreboard-head';
import { ScorekeeperQueuePanel } from '../scorekeeper-queue-panel';
import { RulesPanel } from '../rules-panel';
import { ScoringPanel } from '../scoring-panel';
import { TimeoutPanel } from '../timeout-panel';
import type { ScoreboardViewProps } from './scoreboard-view.types';

/**
 * The field-ready scoreboard: score first, then the controls a scorekeeper
 * reaches for, then the sync surface and the finalize gate. On desktop the
 * panels form a two-column grid; on a phone they stack in the same order.
 */
export function ScoreboardView(props: ScoreboardViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.scoreboardPage}
      viewTestId={TEST_IDS.scoreboardView}
      className="app-scoreboard"
      backLabel={props.backLabel}
      backTestId={TEST_IDS.scoreboardBack}
      onBack={props.onBack}
      notice={props.permissionNotice}
      state={{ view: props, variant: 'detail', ...SCOREBOARD_STATE_TEST_IDS }}
    >
      <ScoreboardHead view={props.head} />

      <div className="app-scoreboard__grid">
        <ScoringPanel view={props.scoring} />
        <ScorekeeperQueuePanel view={props.queue} />
        <TimeoutPanel view={props.timeouts} />
        <MatchStatePanel view={props.state} />
        <RulesPanel heading={props.rulesHeading} intro={props.rulesIntro} rules={props.rules} />
        <FinalizePanel view={props.finalize} />
      </div>

      <MatchTimelinePanel view={props.timeline} />
    </DetailScreen>
  );
}
