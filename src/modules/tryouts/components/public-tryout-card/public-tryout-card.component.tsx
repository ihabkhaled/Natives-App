import { IonNote, IonText } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { PublicTryoutCardProps } from './public-tryout-card.types';

/**
 * One open session, as a prospective player reads it: what it is, when and
 * where it runs (Cairo time), how full it is, and one way in. The meter is
 * decorative — the places sentence beside it carries the same fact in text.
 */
export function PublicTryoutCard(props: PublicTryoutCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li
      data-testid={TEST_IDS.tryoutPublicSession}
      className={cx(
        'app-surface-card app-public-session',
        item.isSelected ? 'app-public-session--selected' : '',
        item.isOpen ? '' : 'app-public-session--closed',
      )}
    >
      <div className="app-public-session__head">
        <IonText>
          <h3 className="app-public-session__title m-0">{item.name}</h3>
        </IonText>
        <StatusChip label={item.statusLabel} tone={item.statusTone} />
      </div>

      <dl className="app-public-session__facts">
        <div className="app-public-session__fact">
          <dt className="app-eyebrow">{item.whenLabel}</dt>
          <dd>{item.whenValue}</dd>
          <dd className="app-public-session__time">{item.timeValue}</dd>
        </div>
        <div className="app-public-session__fact">
          <dt className="app-eyebrow">{item.whereLabel}</dt>
          <dd>{item.whereValue}</dd>
        </div>
        <div className="app-public-session__fact">
          <dt className="app-eyebrow">{item.placesLabel}</dt>
          <dd>{item.placesValue}</dd>
        </div>
      </dl>

      <div className="app-public-session__meter" aria-hidden="true">
        <span
          className={cx(
            'app-public-session__meter-fill',
            item.isFull ? 'app-public-session__meter-fill--full' : '',
          )}
          style={{ inlineSize: `${String(item.takenPercent)}%` }}
        />
      </div>

      {item.waitlistValue === null ? null : <IonNote>{item.waitlistValue}</IonNote>}

      <AppButton
        label={item.applyLabel}
        tone={item.isSelected ? 'secondary' : 'primary'}
        expand
        disabled={!item.isOpen}
        testId={TEST_IDS.tryoutPublicApply}
        onClick={item.onApply}
      />
    </li>
  );
}
