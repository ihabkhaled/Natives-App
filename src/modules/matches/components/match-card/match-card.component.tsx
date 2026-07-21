import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { MatchCardProps } from './match-card.types';

/** One match: the score on the lead side, state and entry points on the trail. */
export function MatchCard(props: MatchCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li
      data-testid={TEST_IDS.matchCard}
      className={`app-surface-card app-match-card${item.isLive ? ' app-match-card--live' : ''}`}
    >
      <div className="app-match-card__main">
        <IonText>
          <p className="app-match-card__score m-0">{item.scoreLabel}</p>
        </IonText>
        <IonNote>{`${item.resultLabel} · ${item.homeAwayLabel}`}</IonNote>
      </div>
      <div className="app-match-card__meta">
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
        <div className="app-match-card__actions">
          <AppButton
            label={item.openScoreboardLabel}
            tone="secondary"
            testId={TEST_IDS.matchOpenScoreboard}
            onClick={() => {
              props.onOpenScoreboard(item.id);
            }}
          />
          <AppButton
            label={item.openStatisticsLabel}
            tone="ghost"
            testId={TEST_IDS.matchOpenStatistics}
            onClick={() => {
              props.onOpenStatistics(item.id);
            }}
          />
        </div>
      </div>
    </li>
  );
}
