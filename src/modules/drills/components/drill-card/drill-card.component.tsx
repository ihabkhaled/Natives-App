import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { DrillCardProps } from './drill-card.types';

/**
 * One catalogue entry: name, category/intensity/duration, its tags, and a
 * status chip. Archived drills render through the same card as active ones —
 * only the chip's tone changes — so a retired drill stays visible in the
 * list rather than silently vanishing from it.
 */
export function DrillCard(props: DrillCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.drillCard} className="app-drill-card">
      <button
        type="button"
        className="app-drill-card__open"
        aria-label={item.ariaLabel}
        onClick={() => {
          props.onOpen(item.id);
        }}
      >
        <IonText>
          <p className="app-drill-card__name m-0">{item.name}</p>
        </IonText>
        <IonNote>
          {item.categoryLabel} · {item.intensityLabel} · {item.durationLabel}
        </IonNote>
        <IonNote>{item.tagsSummary}</IonNote>
      </button>
      <StatusChip
        label={item.statusLabel}
        tone={item.statusTone}
        testId={TEST_IDS.drillStatusChip}
      />
    </li>
  );
}
