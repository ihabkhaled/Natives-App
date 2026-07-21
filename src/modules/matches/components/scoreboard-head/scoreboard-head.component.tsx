import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { ScoreboardHeadProps } from './scoreboard-head.types';

/**
 * The big legible score, sized for a glance from the sideline.
 *
 * The numeric pair is marked `aria-hidden` and a single polite live region
 * carries the spoken form, so a screen reader announces "Ultimate Natives 8,
 * opponent 6. Live." once instead of reading two loose digits.
 */
export function ScoreboardHead(props: ScoreboardHeadProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.scoreboardScore}
      aria-label={view.liveRegionLabel}
      className="app-surface-card app-scoreboard-head"
    >
      <div className="app-scoreboard-head__row" aria-hidden="true">
        <div className="app-scoreboard-head__side">
          <IonNote>{view.usLabel}</IonNote>
          <p data-testid={TEST_IDS.scoreboardOurScore} className="app-scoreboard-head__value m-0">
            {view.ourScore}
          </p>
        </div>
        <span className="app-scoreboard-head__dash">–</span>
        <div className="app-scoreboard-head__side">
          <IonNote>{view.themLabel}</IonNote>
          <p data-testid={TEST_IDS.scoreboardTheirScore} className="app-scoreboard-head__value m-0">
            {view.theirScore}
          </p>
        </div>
      </div>

      <p data-testid={TEST_IDS.scoreboardLive} className="sr-only" role="status" aria-live="polite">
        {view.announcement}
      </p>

      <div className="app-scoreboard-head__meta">
        <StatusChip
          label={view.statusLabel}
          tone={view.statusTone}
          testId={TEST_IDS.scoreboardStatus}
        />
        <IonText color="medium">
          <p className="m-0 text-sm">{`${view.periodLabel} · ${view.capLabel}: ${view.capValue}`}</p>
        </IonText>
      </div>
    </section>
  );
}
