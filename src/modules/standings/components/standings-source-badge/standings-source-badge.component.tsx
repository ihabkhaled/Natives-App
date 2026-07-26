import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { StandingsSourceBadgeProps } from './standings-source-badge.types';

/**
 * Provenance made visible: manual and imported rows carry a badge whose
 * disclosure reveals the mandatory reconciliation note, the source reference,
 * and who recorded it. A native disclosure keeps it keyboard-reachable.
 */
export function StandingsSourceBadge(props: StandingsSourceBadgeProps): React.JSX.Element {
  const { provenance } = props;
  return provenance === null ? (
    <StatusChip
      testId={TEST_IDS.standingsSourceBadge}
      label={props.badge.label}
      tone={props.badge.tone}
    />
  ) : (
    <details className="app-provenance" data-testid={TEST_IDS.standingsSourceBadge}>
      <summary className="app-provenance__summary" title={provenance.toggleLabel}>
        <StatusChip label={props.badge.label} tone={props.badge.tone} />
      </summary>
      <div className="app-provenance__popover" data-testid={TEST_IDS.standingsProvenancePopover}>
        <p className="app-provenance__heading m-0">{provenance.heading}</p>
        <p className="m-0">{provenance.note}</p>
        {provenance.reference === null ? null : <IonNote>{provenance.reference}</IonNote>}
        {provenance.recordedBy === null ? null : <IonNote>{provenance.recordedBy}</IonNote>}
        <IonNote>{provenance.computedAt}</IonNote>
      </div>
    </details>
  );
}
