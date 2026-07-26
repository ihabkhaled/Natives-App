import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList } from '@/shared/ui';

import { AchievementTransitionBar } from '../achievement-transition-bar';
import type { AchievementDetailProps } from './achievement-detail.types';

/**
 * One opened claim: its facts, the approval timeline as text (never colour
 * alone), the terminal rejection reason when one exists, and the gated
 * transition bar.
 */
export function AchievementDetail(props: AchievementDetailProps): React.JSX.Element {
  const { view } = props;
  return (
    <div
      className="app-surface-card app-achievement-detail"
      role="group"
      aria-label={view.heading}
      data-testid={TEST_IDS.achievementDetail}
    >
      <IonText>
        <h3 className="m-0">{view.heading}</h3>
      </IonText>
      <FactList items={view.facts} ariaLabel={view.heading} />
      <div data-testid={TEST_IDS.achievementTimeline}>
        <p className="app-eyebrow m-0">{view.timelineHeading}</p>
        <ol className="app-timeline">
          {view.timeline.map((step) => (
            <li
              key={step.key}
              className={
                step.isReached
                  ? 'app-timeline__step app-timeline__step--reached'
                  : 'app-timeline__step'
              }
              aria-current={step.isCurrent ? 'step' : undefined}
            >
              {step.label}
            </li>
          ))}
        </ol>
      </div>
      {view.rejectionReason === null ? null : (
        <IonNote data-testid={TEST_IDS.achievementRejectionReason}>
          {`${view.rejectionReasonLabel}: ${view.rejectionReason}`}
        </IonNote>
      )}
      <AchievementTransitionBar view={view} />
      <AppButton label={view.closeLabel} tone="ghost" onClick={view.onClose} />
    </div>
  );
}
